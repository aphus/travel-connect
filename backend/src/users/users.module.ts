import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Trip } from '../trips/entities/trip.entity';
import { JoinRequest } from '../trips/entities/join_request.entity';
import { TripMember } from '../trips/entities/trip_member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Trip, JoinRequest, TripMember])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
