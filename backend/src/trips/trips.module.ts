import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { JoinRequest } from './entities/join_request.entity';
import { TripMember } from './entities/trip_member.entity';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripMember, JoinRequest]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
