import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Trip } from '../trips/entities/trip.entity';
import { TripMember } from '../trips/entities/trip_member.entity';

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,

    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,

    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,
  ) {}

  async findByTrip(tripId: string, userId: string) {
    await this.ensureCanAccessTrip(tripId, userId);

    return this.messagesRepository.find({
      where: { trip_id: tripId },
      relations: ['sender'],
      order: { created_at: 'ASC' },
      select: {
        id: true,
        trip_id: true,
        sender_id: true,
        content: true,
        created_at: true,
        sender: {
          id: true,
          full_name: true,
          avatar_url: true,
        },
      },
    });
  }

  async create(tripId: string, senderId: string, dto: CreateMessageDto) {
    await this.ensureCanAccessTrip(tripId, senderId);

    const content = dto.content?.trim();

    if (!content) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const message = this.messagesRepository.create({
      trip_id: tripId,
      sender_id: senderId,
      content,
    });

    const savedMessage = await this.messagesRepository.save(message);

    return this.messagesRepository.findOneOrFail({
      where: { id: savedMessage.id },
      relations: ['sender'],
      select: {
        id: true,
        trip_id: true,
        sender_id: true,
        content: true,
        created_at: true,
        sender: {
          id: true,
          full_name: true,
          avatar_url: true,
        },
      },
    });
  }

  async ensureCanAccessTrip(tripId: string, userId: string) {
    await this.ensureTripExists(tripId);

    const membership = await this.tripMembersRepository.findOne({
      where: {
        trip: { id: tripId },
        user: { id: userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Only active trip members can access chat');
    }
  }

  private async ensureTripExists(tripId: string) {
    if (!isValidUuid(tripId)) {
      throw new BadRequestException('Invalid trip id');
    }

    const trip = await this.tripsRepository.findOne({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }
}
