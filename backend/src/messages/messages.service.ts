import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Trip } from '../trips/entities/trip.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
  ) {}

  async findByTrip(tripId: string) {
    await this.ensureTripExists(tripId);

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
    await this.ensureTripExists(tripId);

    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('Message content cannot be empty');
    }

    // TODO: After TripMembers module is merged, validate sender is an active member of this trip.
    const message = this.messagesRepository.create({
      trip_id: tripId,
      sender_id: senderId,
      content,
    });

    return this.messagesRepository.save(message);
  }

  private async ensureTripExists(tripId: string) {
    const trip = await this.tripsRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }
}
