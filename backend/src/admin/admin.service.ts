import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';
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
    private readonly uploadService: UploadService,
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
