import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripMember } from '../trips/entities/trip_member.entity';
import { User } from '../users/entities/user.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Trip, TripMember, User]), NotificationsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule { }
