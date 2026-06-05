import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { Report, ReportStatus } from './entities/report.entity';
import { MemberRole, TripMember } from '../trips/entities/trip_member.entity';
import { Trip } from '../trips/entities/trip.entity';
import { User, UserRole } from '../users/entities/user.entity';

type AuthUser = {
  sub: string;
  role: string;
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto) {
    if (reporterId === dto.reported_user_id) {
      throw new BadRequestException('Users cannot report themselves');
    }

    const trip = await this.tripsRepository.findOne({
      where: { id: dto.trip_id },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const reportedUser = await this.usersRepository.findOne({
      where: { id: dto.reported_user_id },
    });
    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    await this.ensureActiveTripMember(
      dto.trip_id,
      reporterId,
      'Only active trip members can create reports',
    );
    await this.ensureActiveTripMember(
      dto.trip_id,
      dto.reported_user_id,
      'Reported user must be an active trip member',
    );

    const report = this.reportsRepository.create({
      trip_id: dto.trip_id,
      reporter_id: reporterId,
      reported_id: dto.reported_user_id,
      reason: dto.reason.trim(),
      description: dto.description?.trim() || null,
      status: ReportStatus.PENDING,
      admin_note: null,
    });

    return this.reportsRepository.save(report);
  }

  findAll() {
    return this.findReports();
  }

  async findByTrip(tripId: string, user: AuthUser) {
    const trip = await this.tripsRepository.findOne({
      where: { id: tripId },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (user.role !== UserRole.ADMIN) {
      const leaderMembership = await this.tripMembersRepository.findOne({
        where: {
          trip: { id: tripId },
          user: { id: user.sub },
          role: MemberRole.LEADER,
        },
      });

      if (!leaderMembership && trip.leaderId !== user.sub) {
        throw new ForbiddenException(
          'Only admins or trip leaders can view trip reports',
        );
      }
    }

    return this.findReports({ trip_id: tripId });
  }

  async resolve(reportId: string, dto: ResolveReportDto) {
    const report = await this.reportsRepository.findOne({
      where: { id: reportId },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = dto.status;

    if (dto.admin_note !== undefined) {
      report.admin_note = dto.admin_note.trim() || null;
    }

    await this.reportsRepository.save(report);

    return this.findOneWithRelations(reportId);
  }

  private async ensureActiveTripMember(
    tripId: string,
    userId: string,
    message: string,
  ) {
    const membership = await this.tripMembersRepository.findOne({
      where: {
        trip: { id: tripId },
        user: { id: userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException(message);
    }
  }

  private findReports(where?: Partial<Pick<Report, 'trip_id'>>) {
    return this.reportsRepository.find({
      where,
      relations: ['reporter', 'reported', 'trip'],
      order: { created_at: 'DESC' },
      select: this.reportSelect,
    });
  }

  private async findOneWithRelations(reportId: string) {
    return this.reportsRepository.findOne({
      where: { id: reportId },
      relations: ['reporter', 'reported', 'trip'],
      select: this.reportSelect,
    });
  }

  private readonly reportSelect = {
    id: true,
    trip_id: true,
    reporter_id: true,
    reported_id: true,
    reason: true,
    description: true,
    status: true,
    admin_note: true,
    created_at: true,
    reporter: {
      id: true,
      email: true,
      full_name: true,
      avatar_url: true,
      role: true,
    },
    reported: {
      id: true,
      email: true,
      full_name: true,
      avatar_url: true,
      role: true,
    },
    trip: {
      id: true,
      leaderId: true,
      destination: true,
      destinationPlace: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  };
}
