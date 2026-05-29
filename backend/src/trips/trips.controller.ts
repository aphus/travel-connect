import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { FilterTripsDto } from './dto/filter-trips.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Public()
  @Get()
  findAll(@Query() filters: FilterTripsDto) {
    return this.tripsService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateTripDto) {
    return this.tripsService.create(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/created')
  findMyCreatedTrips(@CurrentUser() user: { sub: string }) {
    return this.tripsService.findCreatedByLeader(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/joined')
  findMyJoinedTrips(@CurrentUser() user: { sub: string }) {
    return this.tripsService.findJoinedByUser(user.sub);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findPublicOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/relation')
  findRelation(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.tripsService.findRelation(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  createJoinRequest(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Body() body?: { message?: string },
  ) {
    return this.tripsService.createJoinRequest(id, user.sub, body?.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/requests')
  findJoinRequests(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.tripsService.findJoinRequests(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/requests/:requestId/approve')
  approveJoinRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.tripsService.approveJoinRequest(id, requestId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/requests/:requestId/reject')
  rejectJoinRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.tripsService.rejectJoinRequest(id, requestId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/join-request')
  cancelOwnJoinRequest(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.tripsService.cancelOwnJoinRequest(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  findMembers(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.tripsService.findMembers(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/members/:memberUserId')
  removeMember(
    @Param('id') id: string,
    @Param('memberUserId') memberUserId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.tripsService.removeMember(id, memberUserId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/leave')
  leaveTrip(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.tripsService.leaveTrip(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  completeTrip(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.tripsService.completeByLeader(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/cancel')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.tripsService.cancelByLeader(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/mark-completed')
  markCompleted(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.tripsService.markCompletedByLeader(id, user.sub);
  }
}
