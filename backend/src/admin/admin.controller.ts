import { Controller, Get, Param, Patch, UseGuards, Body, Query, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string, @Query('days') days?: number) {
    return this.adminService.banUser(id);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('trips')
  listTrips() {
    return this.adminService.listTrips();
  }

  @Patch('trips/:id/cancel')
  cancelTrip(@Param('id') id: string) {
    return this.adminService.cancelTrip(id);
  }

  @Get('reports')
  listReports() {
    return this.adminService.listReports();
  }

  @Patch('users/:id/warn')
  warnUser(@Param('id') id: string) {
    return this.adminService.warnUser(id);
  }

  @Get('users/:id/trips')
  getUserTrips(@Param('id') id: string) {
    return this.adminService.getUserTrips(id);
  }

  @Post('trips/:id/notify')
  sendTripNotification(
    @Param('id') id: string,
    @Body() payload: { type: string; message: string; broadcastToMembers: boolean }
  ) {
    return this.adminService.sendTripNotification(id, payload);
  }
}


