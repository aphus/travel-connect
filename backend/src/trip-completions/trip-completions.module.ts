import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripCompletionConfirmation } from './entities/trip-completion-confirmation.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripCompletionsController } from './trip-completions.controller';
import { TripCompletionsService } from './trip-completions.service';

@Module({
  imports: [TypeOrmModule.forFeature([TripCompletionConfirmation, Trip])],
  controllers: [TripCompletionsController],
  providers: [TripCompletionsService],
  exports: [TripCompletionsService],
})
export class TripCompletionsModule {}
