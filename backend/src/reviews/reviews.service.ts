import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

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

    if (trip.status !== TripStatus.COMPLETED) {
      throw new BadRequestException('Reviews are only allowed for completed trips');
    }

    const reviewee = await this.usersRepository.findOne({
      where: { id: dto.reviewee_id },
    });
    if (!reviewee) {
      throw new NotFoundException('Reviewee not found');
    }

    // TODO: After TripMembers module is merged, validate reviewer and reviewee are active members of this trip.
    const existing = await this.reviewsRepository.findOne({
      where: {
        trip_id: dto.trip_id,
        reviewer_id: reviewerId,
        reviewee_id: dto.reviewee_id,
      },
    });
    if (existing) {
      throw new ConflictException('This user has already been reviewed by you for this trip');
    }

    const review = this.reviewsRepository.create({
      trip_id: dto.trip_id,
      reviewer_id: reviewerId,
      reviewee_id: dto.reviewee_id,
      rating: dto.rating,
      comment: dto.comment?.trim() || null,
    });

    const savedReview = await this.reviewsRepository.save(review);
    await this.recalculateTrustScore(dto.reviewee_id);

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
          start_date: true,
          end_date: true,
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
}
