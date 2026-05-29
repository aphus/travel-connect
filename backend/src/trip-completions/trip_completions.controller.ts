import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TripCompletionsService } from './trip_completions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('trips/:tripId/completion-confirmations')
export class TripCompletionsController {
  constructor(
    private readonly tripCompletionsService: TripCompletionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  confirm(
    @Param('tripId') tripId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.tripCompletionsService.confirm(tripId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findByTrip(@Param('tripId') tripId: string) {
    return this.tripCompletionsService.findByTrip(tripId);
  }
}
