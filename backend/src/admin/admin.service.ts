import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    private readonly usersService: UsersService,
    private readonly tripsService: TripsService,
  ) { }

  listUsers() {
    return this.usersRepository.find({
      order: { created_at: 'DESC' },
      select: [
        'id',
        'email',
        'full_name',
        'role',
        'is_banned',
        'trust_score',
        'tripsCreated',
        'created_at',
      ],
    });
  }

  listTrips() {
    return this.tripsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['members', 'members.user'],
    });
  }

  async listReports() {
    const reports = await this.reportsRepository.find({
      order: { created_at: 'DESC' },
      relations: ['reporter', 'reported', 'trip'],
    });

    const reportCountMap: Record<string, number> = {};
    reports.forEach((r) => {
      const reportedId = r.reported?.id;
      if (reportedId) {
        reportCountMap[reportedId] = (reportCountMap[reportedId] || 0) + 1;
      }
    });

    return reports.map((r) => {
      const reportedId = r.reported?.id;
      const totalReports = reportedId ? reportCountMap[reportedId] : 0;

      return {
        ...r,
        previousReportCount: Math.max(0, totalReports - 1),
        accountStatus: r.reported?.is_banned ? 'BỊ KHÓA' : 'HOẠT ĐỘNG',
      };
    });
  }

  async banUser(userId: string, days?: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.is_banned = true;

    if (days) {
      const unbanDate = new Date();
      unbanDate.setDate(unbanDate.getDate() + days);
      user.banned_until = unbanDate;
    } else {
      user.banned_until = null;
    }

    return this.usersRepository.save(user);
  }

  cancelTrip(tripId: string) {
    return this.tripsService.cancelByAdmin(tripId);
  }
}
