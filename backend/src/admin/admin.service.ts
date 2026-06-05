import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

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
    private readonly notificationsService: NotificationsService,
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
        'avatar_url',
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

  async unbanUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    user.is_banned = false;
    user.banned_until = null;
    return this.usersRepository.save(user);
  }

  cancelTrip(tripId: string) {
    return this.tripsService.cancelByAdmin(tripId);
  }

  async warnUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.notificationsService.create({
      userId: user.id,
      type: NotificationType.SYSTEM_WARNING,
      title: 'Cảnh cáo vi phạm',
      message: 'Tài khoản của bạn đã bị người dùng khác báo cáo do vi phạm tiêu chuẩn cộng đồng. Vui lòng tuân thủ quy định nếu không tài khoản sẽ bị khóa.',
    });

    return { success: true, message: 'Đã gửi thông báo cảnh cáo' };
  }

  async getUserTrips(userId: string) {
    const createdTrips = await this.tripsRepository.find({
      where: { leaderId: userId },
      order: { createdAt: 'DESC' },
    });

    const participatedTrips = await this.tripsRepository.find({
      where: {
        members: {
          user: { id: userId }
        },
        leaderId: Not(userId)
      },
      order: { createdAt: 'DESC' },
    });

    return {
      created: createdTrips,
      participated: participatedTrips,
    };
  }

  async sendTripNotification(tripId: string, payload: { type: string; message: string; broadcastToMembers: boolean }) {
    const trip = await this.tripsRepository.findOne({
      where: { id: tripId },
      relations: ['leader', 'members', 'members.user']
    });

    if (!trip) {
      throw new NotFoundException('Không tìm thấy chuyến đi');
    }

    const recipients = new Set<string>();

    if (trip.leaderId) {
      recipients.add(trip.leaderId);
    }

    if (payload.broadcastToMembers && trip.members) {
      trip.members.forEach(member => {
        if (member.user && member.user.id) {
          recipients.add(member.user.id);
        }
      });
    }

    const notificationPromises = Array.from(recipients).map(userId =>
      this.notificationsService.create({
        userId: userId,
        type: 'SYSTEM_WARNING' as any,
        title: payload.broadcastToMembers ? 'Cảnh báo từ Ban Quản Trị' : 'Thông báo từ Hệ thống',
        message: payload.message,
        targetUrl: `/trips/${tripId}`
      })
    );

    await Promise.all(notificationPromises);

    return {
      success: true,
      message: `Đã gửi thông báo thành công đến ${recipients.size} tài khoản.`,
      sentCount: recipients.size
    };
  }
}


