import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
import {
  MemberRole,
  MemberStatus,
  TripMember,
} from './entities/trip-member.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { FilterTripsDto } from './dto/filter-trips.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,
  ) {}

  private validateTripDates(startDate: string, endDate: string) {
    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('start_date must be before or equal to end_date');
    }
  }

  async create(leaderId: string, dto: CreateTripDto) {
    this.validateTripDates(dto.start_date, dto.end_date);

    const createdTrip = this.tripsRepository.create({
      ...dto,
      leader_id: leaderId,
    });

    const trip = await this.tripsRepository.save(createdTrip);
    const leaderMember = this.tripMembersRepository.create({
      trip,
      user: { id: leaderId } as User,
      role: MemberRole.LEADER,
      status: MemberStatus.ACTIVE,
    });

    await this.tripMembersRepository.save(leaderMember);

    return trip;
  }

  async findAll(filters: FilterTripsDto) {
    const qb = this.tripsRepository.createQueryBuilder('trip');

    if (filters.destination) {
      qb.andWhere('LOWER(trip.destination) LIKE :destination', {
        destination: `%${filters.destination.toLowerCase()}%`,
      });
    }

    if (filters.start_date) {
      qb.andWhere('trip.start_date >= :startDate', { startDate: filters.start_date });
    }

    if (filters.end_date) {
      qb.andWhere('trip.end_date <= :endDate', { endDate: filters.end_date });
    }

    if (typeof filters.min_budget === 'number') {
      qb.andWhere('trip.budget >= :minBudget', { minBudget: filters.min_budget });
    }

    if (typeof filters.max_budget === 'number') {
      qb.andWhere('trip.budget <= :maxBudget', { maxBudget: filters.max_budget });
    }

    if (typeof filters.min_members === 'number') {
      qb.andWhere('trip.max_members >= :minMembers', {
        minMembers: filters.min_members,
      });
    }

    if (filters.status) {
      qb.andWhere('trip.status = :status', { status: filters.status });
    }

    return qb.orderBy('trip.created_at', 'DESC').getMany();
  }

  async findOne(id: string) {
    const trip = await this.tripsRepository.findOne({ where: { id } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  async update(tripId: string, userId: string, dto: UpdateTripDto) {
    const trip = await this.findOne(tripId);

    if (trip.leader_id !== userId) {
      throw new ForbiddenException('Only leader can update this trip');
    }

    if (trip.status !== TripStatus.UPCOMING) {
      throw new BadRequestException('Only upcoming trips can be edited');
    }

    if (new Date(trip.start_date) <= new Date()) {
      throw new BadRequestException('Trip cannot be edited after start date');
    }

    const nextStartDate = dto.start_date ?? trip.start_date;
    const nextEndDate = dto.end_date ?? trip.end_date;
    this.validateTripDates(nextStartDate, nextEndDate);

    await this.tripsRepository.update(tripId, dto);
    return this.findOne(tripId);
  }

  async cancelByLeader(tripId: string, userId: string) {
    const trip = await this.findOne(tripId);

    if (trip.leader_id !== userId) {
      throw new ForbiddenException('Only leader can cancel this trip');
    }

    if (trip.status === TripStatus.CANCELLED) {
      return trip;
    }

    await this.tripsRepository.update(tripId, { status: TripStatus.CANCELLED });
    return this.findOne(tripId);
  }

  async cancelByAdmin(tripId: string) {
    const trip = await this.findOne(tripId);

    if (trip.status === TripStatus.CANCELLED) {
      return trip;
    }

    await this.tripsRepository.update(tripId, { status: TripStatus.CANCELLED });
    return this.findOne(tripId);
  }
}
