import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TripCompletionConfirmation } from './entities/trip-completion-confirmation.entity';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { TripMember } from '../trips/entities/trip_member.entity';

@Injectable()
export class TripCompletionsService {
  constructor(
    @InjectRepository(TripCompletionConfirmation)
    private readonly confirmationsRepository: Repository<TripCompletionConfirmation>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,
  ) {}

  async confirm(tripId: string, memberId: string) {
    const trip = await this.tripsRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.leaderId === memberId) {
      throw new BadRequestException(
        'Leader cannot confirm their own trip completion as a member',
      );
    }

    const existing = await this.confirmationsRepository.findOne({
      where: { trip_id: tripId, member_id: memberId },
    });
    if (existing) {
      throw new ConflictException(
        'This member has already confirmed this trip completion',
      );
    }

    if (trip.status !== TripStatus.AWAITING_CONFIRMATION) {
      throw new BadRequestException(
        'Trip completion can only be confirmed while awaiting confirmation',
      );
    }

    const activeMembership = await this.tripMembersRepository.findOne({
      where: {
        trip: { id: tripId },
        user: { id: memberId },
      },
    });
    if (!activeMembership) {
      throw new ForbiddenException(
        'Only active trip members can confirm trip completion',
      );
    }

    const confirmation = this.confirmationsRepository.create({
      trip_id: tripId,
      member_id: memberId,
    });

    const savedConfirmation = await this.saveConfirmation(confirmation);
    const confirmationCount = await this.confirmationsRepository.count({
      where: { trip_id: tripId },
    });

    if (confirmationCount >= 1) {
      await this.tripsRepository.update(tripId, {
        status: TripStatus.COMPLETED,
      });
    }

    const updatedTrip = await this.tripsRepository.findOneOrFail({
      where: { id: tripId },
    });

    return {
      confirmation: savedConfirmation,
      trip_status: updatedTrip.status,
      trip: updatedTrip,
    };
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

  private async saveConfirmation(confirmation: TripCompletionConfirmation) {
    try {
      return await this.confirmationsRepository.save(confirmation);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'This member has already confirmed this trip completion',
        );
      }

      throw error;
    }
  }
}
