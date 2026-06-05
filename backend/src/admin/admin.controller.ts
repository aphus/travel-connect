import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RejectIdentityVerificationDto } from './dto/reject-identity-verification.dto';

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
  banUser(@Param('id') id: string, @Body('days') days?: number) {
    return this.adminService.banUser(id);
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

  @Get('identity-verifications')
  listIdentityVerifications(@Query('status') status?: string) {
    return this.adminService.listIdentityVerifications(status);
  }

  @Patch('identity-verifications/:id/approve')
  approveIdentityVerification(
    @Param('id') id: string,
    @CurrentUser() admin: { sub: string },
  ) {
    return this.adminService.approveIdentityVerification(id, admin.sub);
  }

  @Patch('identity-verifications/:id/reject')
  rejectIdentityVerification(
    @Param('id') id: string,
    @CurrentUser() admin: { sub: string },
    @Body() dto: RejectIdentityVerificationDto,
  ) {
    return this.adminService.rejectIdentityVerification(id, admin.sub, dto);
  }
}
