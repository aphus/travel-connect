import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripCompletionConfirmation } from './entities/trip-completion-confirmation.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripMember } from '../trips/entities/trip_member.entity';
import { TripCompletionsController } from './trip_completions.controller';
import { TripCompletionsService } from './trip_completions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripCompletionConfirmation, Trip, TripMember]),
  ],
  controllers: [TripCompletionsController],
  providers: [TripCompletionsService],
  exports: [TripCompletionsService],
})
export class TripCompletionsModule {}
