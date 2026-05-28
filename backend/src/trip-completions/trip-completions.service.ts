import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripCompletionConfirmation } from './entities/trip-completion-confirmation.entity';
import { Trip } from '../trips/entities/trip.entity';

@Injectable()
export class TripCompletionsService {
  constructor(
    @InjectRepository(TripCompletionConfirmation)
    private readonly confirmationsRepository: Repository<TripCompletionConfirmation>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
  ) {}

  async confirm(tripId: string, memberId: string) {
    const trip = await this.tripsRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.leaderId === memberId) {
      throw new BadRequestException('Leader cannot confirm their own trip completion as a member');
    }

    // TODO: After TripMembers module is merged, validate memberId is an active member of this trip.
    // TODO: After TripStatus is finalized, require trip.status = waiting_confirmation before accepting confirmation.
    const existing = await this.confirmationsRepository.findOne({
      where: { trip_id: tripId, member_id: memberId },
    });
    if (existing) {
      throw new ConflictException('This member has already confirmed this trip completion');
    }

    const confirmation = this.confirmationsRepository.create({
      trip_id: tripId,
      member_id: memberId,
    });

    return this.confirmationsRepository.save(confirmation);
  }

  findByTrip(tripId: string) {
    return this.confirmationsRepository.find({
      where: { trip_id: tripId },
      relations: ['member'],
      order: { confirmed_at: 'ASC' },
      select: {
        id: true,
        trip_id: true,
        member_id: true,
        confirmed_at: true,
        member: {
          id: true,
          full_name: true,
          avatar_url: true,
        },
      },
    });
  }
}
