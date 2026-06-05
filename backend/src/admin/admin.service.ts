import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import {
  IdentityVerificationRequest,
  IdentityVerificationStatus,
} from '../users/entities/identity-verification-request.entity';
import { UploadService } from '../upload/upload.service';
import { RejectIdentityVerificationDto } from './dto/reject-identity-verification.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    @InjectRepository(IdentityVerificationRequest)
    private readonly identityVerificationRequestsRepository: Repository<IdentityVerificationRequest>,
    private readonly usersService: UsersService,
    private readonly tripsService: TripsService,
    private readonly notificationsService: NotificationsService,
    private readonly uploadService: UploadService,
  ) {}

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
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

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
      message:
        'Tài khoản của bạn đã bị người dùng khác báo cáo do vi phạm tiêu chuẩn cộng đồng. Vui lòng tuân thủ quy định nếu không tài khoản sẽ bị khóa.',
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
          user: { id: userId },
        },
        leaderId: Not(userId),
      },
      order: { createdAt: 'DESC' },
    });

    return {
      created: createdTrips,
      participated: participatedTrips,
    };
  }

  async sendTripNotification(
    tripId: string,
    payload: { type: string; message: string; broadcastToMembers: boolean },
  ) {
    const trip = await this.tripsRepository.findOne({
      where: { id: tripId },
      relations: ['leader', 'members', 'members.user'],
    });

    if (!trip) {
      throw new NotFoundException('Không tìm thấy chuyến đi');
    }

    const recipients = new Set<string>();

    if (trip.leaderId) {
      recipients.add(trip.leaderId);
    }

    if (payload.broadcastToMembers && trip.members) {
      trip.members.forEach((member) => {
        if (member.user?.id) {
          recipients.add(member.user.id);
        }
      });
    }

    const notificationPromises = Array.from(recipients).map((userId) =>
      this.notificationsService.create({
        userId,
        type: NotificationType.SYSTEM_WARNING,
        title: payload.broadcastToMembers
          ? 'Cảnh báo từ Ban Quản Trị'
          : 'Thông báo từ Hệ thống',
        message: payload.message,
        targetUrl: `/trips/${tripId}`,
      }),
    );

    await Promise.all(notificationPromises);

    return {
      success: true,
      message: `Đã gửi thông báo thành công đến ${recipients.size} tài khoản.`,
      sentCount: recipients.size,
    };
  }

  async listIdentityVerifications(status?: string) {
    const where = status
      ? { status: this.parseIdentityVerificationStatus(status) }
      : {};

    const requests = await this.identityVerificationRequestsRepository.find({
      where,
      relations: ['user'],
      order: { submitted_at: 'DESC' },
    });

    return requests.map((request) => ({
      id: request.id,
      user: {
        id: request.user.id,
        full_name: request.user.full_name,
        email: request.user.email,
      },
      document_url: request.document_url,
      status: request.status,
      submitted_at: request.submitted_at,
      reject_reason: request.reject_reason,
    }));
  }

  async approveIdentityVerification(requestId: string, adminId: string) {
    const request = await this.findIdentityVerificationRequest(requestId);

    request.status = IdentityVerificationStatus.APPROVED;
    request.reviewed_by_id = adminId;
    request.reviewed_at = new Date();
    request.reject_reason = null;

    request.user.identity_verified = true;
    request.user.profile_completed = this.usersService.isProfileCompleted(
      request.user,
    );

    await this.usersRepository.save(request.user);
    await this.notificationsService.create({
      userId: request.user.id,
      type: NotificationType.SYSTEM_WARNING,
      title: 'Hồ sơ định danh đã được duyệt',
      message:
        'Hồ sơ định danh nâng cao của bạn đã được quản trị viên duyệt. Bạn có thể tạo và tham gia chuyến đi nếu hồ sơ tin cậy đã hoàn thiện.',
      targetUrl: '/profile',
    });
    await this.cleanupIdentityDocument(request);
    await this.identityVerificationRequestsRepository.save(request);

    return { message: 'Duyệt xác minh danh tính thành công.' };
  }

  async rejectIdentityVerification(
    requestId: string,
    adminId: string,
    dto: RejectIdentityVerificationDto,
  ) {
    const request = await this.findIdentityVerificationRequest(requestId);

    request.status = IdentityVerificationStatus.REJECTED;
    request.reviewed_by_id = adminId;
    request.reviewed_at = new Date();
    request.reject_reason = dto.reason?.trim() || null;

    request.user.identity_verified = false;
    request.user.profile_completed = false;

    await this.usersRepository.save(request.user);
    await this.notificationsService.create({
      userId: request.user.id,
      type: NotificationType.SYSTEM_WARNING,
      title: 'Hồ sơ định danh chưa được duyệt',
      message: request.reject_reason
        ? `Hồ sơ định danh nâng cao của bạn chưa được duyệt. Lý do: ${request.reject_reason}`
        : 'Hồ sơ định danh nâng cao của bạn chưa được duyệt. Vui lòng kiểm tra lại tài liệu và gửi lại.',
      targetUrl: '/profile',
    });
    await this.cleanupIdentityDocument(request);
    await this.identityVerificationRequestsRepository.save(request);

    return { message: 'Từ chối xác minh danh tính thành công.' };
  }

  private async findIdentityVerificationRequest(requestId: string) {
    const request = await this.identityVerificationRequestsRepository.findOne({
      where: { id: requestId },
      relations: ['user'],
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu xác minh danh tính');
    }

    return request;
  }

  private async cleanupIdentityDocument(request: IdentityVerificationRequest) {
    if (request.document_public_id) {
      await this.uploadService.deleteImage(request.document_public_id);
    }

    request.document_url = null;
    request.document_public_id = null;
  }

  private parseIdentityVerificationStatus(status: string) {
    if (
      Object.values(IdentityVerificationStatus).includes(
        status as IdentityVerificationStatus,
      )
    ) {
      return status as IdentityVerificationStatus;
    }

    throw new BadRequestException('Trạng thái xác minh danh tính không hợp lệ');
  }
}
