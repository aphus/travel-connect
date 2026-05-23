import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Report } from '../reports/entities/report.entity';
import { UsersModule } from '../users/users.module';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trip, Report]),
    UsersModule,
    TripsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
