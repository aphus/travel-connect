import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { ReportsService } from './reports.service';

type AuthUser = {
  sub: string;
  role: string;
};

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.sub, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('trips/:tripId')
  findByTrip(@Param('tripId') tripId: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.findByTrip(tripId, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveReportDto) {
    return this.reportsService.resolve(id, dto);
  }
}
