import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { JoinRequest } from './entities/join_request.entity';
import { TripMember } from './entities/trip_member.entity';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripMember, JoinRequest]),
    NotificationsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
