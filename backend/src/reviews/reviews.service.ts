import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  normalizeTripStatus,
  Trip,
  TripStatus,
} from '../trips/entities/trip.entity';
import { TripMember } from '../trips/entities/trip_member.entity';
import { User } from '../users/entities/user.entity';
import { NotificationType, NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly notificationsService: NotificationsService,
  ) { }

  private getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getTripDestinationLabel(
    trip: Pick<Trip, 'destination' | 'destinationPlace'>,
  ) {
    return trip.destinationPlace
      ? `${trip.destinationPlace}, ${trip.destination}`
      : trip.destination;
  }

  private async syncReviewableTripStatus(trip: Trip) {
    const status = normalizeTripStatus(trip.status);
    const canAutoComplete = [
      TripStatus.UPCOMING,
      TripStatus.ONGOING,
      TripStatus.AWAITING_CONFIRMATION,
    ].includes(status);

    if (canAutoComplete && trip.endDate < this.getTodayDateString()) {
      await this.tripsRepository.update(trip.id, {
        status: TripStatus.COMPLETED,
      });
      trip.status = TripStatus.COMPLETED;
    }

    return trip;
  }

  async create(reviewerId: string, dto: CreateReviewDto) {
    if (reviewerId === dto.reviewee_id) {
      throw new BadRequestException('Users cannot review themselves');
    }

    const trip = await this.tripsRepository.findOne({
      where: { id: dto.trip_id },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    await this.syncReviewableTripStatus(trip);

    if (trip.status !== TripStatus.COMPLETED) {
      throw new BadRequestException(
        'Reviews are only allowed for completed trips',
      );
    }

    const reviewee = await this.usersRepository.findOne({
      where: { id: dto.reviewee_id },
    });
    if (!reviewee) {
      throw new NotFoundException('Reviewee not found');
    }

    await this.ensureActiveTripMember(
      dto.trip_id,
      reviewerId,
      'Only active trip members can create reviews',
    );
    await this.ensureActiveTripMember(
      dto.trip_id,
      dto.reviewee_id,
      'Reviewee must be an active trip member',
    );

    const existing = await this.reviewsRepository.findOne({
      where: {
        trip_id: dto.trip_id,
        reviewer_id: reviewerId,
        reviewee_id: dto.reviewee_id,
      },
    });
    if (existing) {
      throw new ConflictException(
        'This user has already been reviewed by you for this trip',
      );
    }

    const review = this.reviewsRepository.create({
      trip_id: dto.trip_id,
      reviewer_id: reviewerId,
      reviewee_id: dto.reviewee_id,
      rating: dto.rating,
      comment: dto.comment?.trim() || null,
    });

    const savedReview = await this.saveReview(review);
    await this.recalculateTrustScore(dto.reviewee_id);

    await this.notificationsService.create({
      userId: dto.reviewee_id,
      type: NotificationType.NEW_REVIEW,
      title: 'Bạn có đánh giá mới',
      message: `Một thành viên trong chuyến đi ${this.getTripDestinationLabel(trip)} vừa để lại đánh giá cho bạn.`,
      targetUrl: `/profile`,
      metadata: { tripId: trip.id, reviewId: savedReview.id },
    });

    return savedReview;
  }

  findByUser(userId: string) {
    return this.reviewsRepository.find({
      where: { reviewee_id: userId },
      relations: ['reviewer', 'trip'],
      order: { created_at: 'DESC' },
      select: {
        id: true,
        trip_id: true,
        reviewer_id: true,
        reviewee_id: true,
        rating: true,
        comment: true,
        created_at: true,
        reviewer: {
          id: true,
          full_name: true,
          avatar_url: true,
        },
        trip: {
          id: true,
          destination: true,
          destinationPlace: true,
          startDate: true,
          endDate: true,
        },
      },
    });
  }

  findByTrip(tripId: string) {
    return this.reviewsRepository.find({
      where: { trip_id: tripId },
      relations: ['reviewer', 'reviewee'],
      order: { created_at: 'DESC' },
      select: {
        id: true,
        trip_id: true,
        reviewer_id: true,
        reviewee_id: true,
        rating: true,
        comment: true,
        created_at: true,
        reviewer: {
          id: true,
          full_name: true,
          avatar_url: true,
        },
        reviewee: {
          id: true,
          full_name: true,
          avatar_url: true,
        },
      },
    });
  }

  private async recalculateTrustScore(userId: string) {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.reviewee_id = :userId', { userId })
      .getRawOne<{ average: string | null }>();

    const average = result?.average ? Number(result.average) : 0;
    const trustScore = Number(average.toFixed(2));

    await this.usersRepository.update(userId, { trust_score: trustScore });
  }

  private async ensureActiveTripMember(
    tripId: string,
    userId: string,
    message: string,
  ) {
    const membership = await this.tripMembersRepository.findOne({
      where: {
        trip: { id: tripId },
        user: { id: userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException(message);
    }
  }

  private async saveReview(review: Review) {
    try {
      return await this.reviewsRepository.save(review);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'This user has already been reviewed by you for this trip',
        );
      }

      throw error;
    }
  }
}
