import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { FilterTripsDto } from './dto/filter-trips.dto';
import { User } from '../users/entities/user.entity';
import { JoinRequest, RequestStatus } from './entities/join_request.entity';
import { MemberRole, TripMember } from './entities/trip_member.entity';
import {
  NotificationType,
  NotificationsService,
} from '../notifications/notifications.service';

type TripStats = {
  currentMembers: number;
  pendingRequests: number;
};

type TripMemberResponse = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  trustScore: number;
  role: MemberRole;
  joinedAt: Date;
};

const VIETNAMESE_SEARCH_CHARS =
  'ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬáàảãạăắằẳẵặâấầẩẫậÉÈẺẼẸÊẾỀỂỄỆéèẻẽẹêếềểễệÍÌỈĨỊíìỉĩịÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢóòỏõọôốồổỗộơớờởỡợÚÙỦŨỤƯỨỪỬỮỰúùủũụưứừửữựÝỲỶỸỴýỳỷỹỵĐđ';
const VIETNAMESE_SEARCH_REPLACEMENTS =
  'AAAAAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaEEEEEEEEEEEeeeeeeeeeeeIIIIIiiiiiOOOOOOOOOOOOOOOOOoooooooooooooooooUUUUUUUUUUUuuuuuuuuuuuYYYYYyyyyyDd';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  private validateTripDates(startDate: string, endDate: string) {
    if (startDate > endDate) {
      throw new BadRequestException(
        'Ngày kết thúc phải sau hoặc bằng ngày khởi hành',
      );
    }
  }

  private validateTripIsBookable(trip: Trip) {
    if (trip.status !== TripStatus.UPCOMING) {
      throw new BadRequestException('Chuyến đi không còn nhận thành viên');
    }

    if (this.hasTripStarted(trip)) {
      throw new BadRequestException('Chuyến đi đã bắt đầu');
    }
  }

  private getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private hasTripStarted(trip: Pick<Trip, 'startDate'>) {
    return trip.startDate <= this.getTodayDateString();
  }

  private addDays(dateValue: string, days: number) {
    const [year, month, day] = dateValue.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
  }

  private assertLeader(trip: Trip, userId: string) {
    if (trip.leaderId !== userId) {
      throw new ForbiddenException('Chỉ leader mới được thao tác với trip này');
    }
  }

  private normalizeSearchText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private compactSearchText(value: string) {
    return this.normalizeSearchText(value).replace(/\s+/g, '');
  }

  private normalizedDestinationSql() {
    return `LOWER(translate(trip.destination, '${VIETNAMESE_SEARCH_CHARS}', '${VIETNAMESE_SEARCH_REPLACEMENTS}'))`;
  }

  private toPublicTrip(trip: Trip) {
    return {
      id: trip.id,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      maxMembers: trip.maxMembers,
      description: trip.description,
      status: trip.status,
      leaderMarkedCompleted: trip.leaderMarkedCompleted,
      leaderId: trip.leaderId,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      leader: trip.leader
        ? {
            id: trip.leader.id,
            full_name: trip.leader.full_name,
            avatar_url: trip.leader.avatar_url,
            trust_score: Number(trip.leader.trust_score),
          }
        : null,
    };
  }

  private toPublicTripWithStats(
    trip: Trip,
    stats: TripStats,
    extra: Record<string, unknown> = {},
  ) {
    return {
      ...this.toPublicTrip(trip),
      currentMembers: Math.max(stats.currentMembers, 1),
      pendingRequests: stats.pendingRequests,
      ...extra,
    };
  }

  private async loadTripStats(tripIds: string[]) {
    const stats = new Map<string, TripStats>();

    tripIds.forEach((tripId) => {
      stats.set(tripId, { currentMembers: 1, pendingRequests: 0 });
    });

    if (tripIds.length === 0) return stats;

    const [memberRows, pendingRows] = await Promise.all([
      this.dataSource
        .getRepository(TripMember)
        .createQueryBuilder('member')
        .innerJoin(Trip, 'trip', 'trip.id = member.trip_id')
        .select('member.trip_id', 'tripId')
        .addSelect('COUNT(*)', 'count')
        .addSelect(
          'SUM(CASE WHEN member.user_id = trip.leader_id THEN 1 ELSE 0 END)',
          'leaderCount',
        )
        .where('member.trip_id IN (:...tripIds)', { tripIds })
        .groupBy('member.trip_id')
        .getRawMany<{ tripId: string; count: string; leaderCount: string }>(),
      this.dataSource
        .getRepository(JoinRequest)
        .createQueryBuilder('request')
        .select('request.trip_id', 'tripId')
        .addSelect('COUNT(*)', 'count')
        .where('request.trip_id IN (:...tripIds)', { tripIds })
        .andWhere('request.status = :status', { status: RequestStatus.PENDING })
        .groupBy('request.trip_id')
        .getRawMany<{ tripId: string; count: string }>(),
    ]);

    memberRows.forEach((row) => {
      const current = stats.get(row.tripId) ?? {
        currentMembers: 1,
        pendingRequests: 0,
      };
      const memberCount = Number(row.count);
      const hasLeaderMember = Number(row.leaderCount) > 0;

      stats.set(row.tripId, {
        ...current,
        currentMembers: memberCount + (hasLeaderMember ? 0 : 1),
      });
    });

    pendingRows.forEach((row) => {
      const current = stats.get(row.tripId) ?? {
        currentMembers: 1,
        pendingRequests: 0,
      };
      stats.set(row.tripId, {
        ...current,
        pendingRequests: Number(row.count),
      });
    });

    return stats;
  }

  private createPublicTripsQuery() {
    return this.tripsRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.leader', 'leader');
  }

  private scoreTripSearch(
    trip: Trip,
    stats: TripStats,
    filters: FilterTripsDto,
  ) {
    let score = 0;

    if (filters.destination?.trim()) {
      const query = this.normalizeSearchText(filters.destination);
      const compactQuery = this.compactSearchText(filters.destination);
      const destination = this.normalizeSearchText(trip.destination);
      const compactDestination = this.compactSearchText(trip.destination);
      const destinationTokens = destination.split(' ');

      if (destination === query || compactDestination === compactQuery)
        score += 120;
      else if (
        destination.startsWith(query) ||
        compactDestination.startsWith(compactQuery)
      ) {
        score += 95;
      } else if (
        destinationTokens.some((token) => token.startsWith(query)) ||
        destination.includes(query) ||
        compactDestination.includes(compactQuery)
      ) {
        score += 75;
      }
    }

    if (filters.startDate) {
      if (
        trip.startDate <= filters.startDate &&
        trip.endDate >= filters.startDate
      ) {
        score += 60;
      } else {
        const before = this.addDays(filters.startDate, -1);
        const after = this.addDays(filters.startDate, 1);
        if (trip.startDate <= after && trip.endDate >= before) score += 40;
      }
    }

    if (typeof filters.budget === 'number' && trip.budget !== null) {
      const diffRatio = Math.abs(trip.budget - filters.budget) / filters.budget;
      score += Math.max(0, 35 - Math.round(diffRatio * 50));
    }

    if (typeof filters.maxMembers === 'number') {
      const availableSlots = trip.maxMembers - stats.currentMembers;
      if (availableSlots >= filters.maxMembers) score += 25;
      else if (availableSlots >= Math.max(1, filters.maxMembers - 1))
        score += 15;
      else if (trip.maxMembers >= filters.maxMembers) score += 8;
    }

    return score;
  }

  async create(leaderId: string, dto: CreateTripDto) {
    this.validateTripDates(dto.startDate, dto.endDate);

    if (dto.startDate < this.getTodayDateString()) {
      throw new BadRequestException('Ngày khởi hành không được ở quá khứ');
    }

    const destination = dto.destination.trim();
    if (!destination) {
      throw new BadRequestException('Vui lòng nhập địa điểm chuyến đi');
    }

    const savedTrip = await this.dataSource.transaction(async (manager) => {
      const trip = manager.getRepository(Trip).create({
        destination,
        startDate: dto.startDate,
        endDate: dto.endDate,
        budget: dto.budget ?? null,
        maxMembers: dto.maxMembers,
        description: dto.description?.trim() || null,
        leaderId,
      });

      const savedTrip = await manager.getRepository(Trip).save(trip);
      await manager.getRepository(TripMember).save(
        manager.getRepository(TripMember).create({
          trip: { id: savedTrip.id } as Trip,
          user: { id: leaderId } as User,
          role: MemberRole.LEADER,
        }),
      );
      await manager
        .getRepository(User)
        .increment({ id: leaderId }, 'tripsCreated', 1);

      return savedTrip;
    });

    return this.findPublicOne(savedTrip.id);
  }

  async findAll(filters: FilterTripsDto) {
    const qb = this.createPublicTripsQuery();

    qb.where('trip.status = :status', {
      status: filters.status ?? TripStatus.UPCOMING,
    });

    if ((filters.status ?? TripStatus.UPCOMING) === TripStatus.UPCOMING) {
      qb.andWhere('trip.start_date > :today', {
        today: this.getTodayDateString(),
      });
    }

    if (filters.destination?.trim()) {
      const normalizedDestination = this.normalizedDestinationSql();
      const normalizedQuery = this.normalizeSearchText(filters.destination);
      const compactQuery = this.compactSearchText(filters.destination);
      const tokens = normalizedQuery.split(' ').filter(Boolean);

      qb.andWhere(
        new Brackets((where) => {
          tokens.forEach((token, index) => {
            where.orWhere(
              `${normalizedDestination} LIKE :destinationToken${index}`,
              {
                [`destinationToken${index}`]: `%${token}%`,
              },
            );
          });

          if (compactQuery) {
            where.orWhere(
              `REPLACE(${normalizedDestination}, ' ', '') LIKE :destinationCompact`,
              { destinationCompact: `%${compactQuery}%` },
            );
          }
        }),
      );
    }

    if (filters.startDate && filters.endDate) {
      qb.andWhere('trip.start_date <= :searchEndDate', {
        searchEndDate: this.addDays(filters.endDate, 1),
      });
      qb.andWhere('trip.end_date >= :searchStartDate', {
        searchStartDate: this.addDays(filters.startDate, -1),
      });
    } else if (filters.startDate) {
      qb.andWhere('trip.start_date <= :startDateUpper', {
        startDateUpper: this.addDays(filters.startDate, 1),
      });
      qb.andWhere('trip.end_date >= :startDateLower', {
        startDateLower: this.addDays(filters.startDate, -1),
      });
    } else if (filters.endDate) {
      qb.andWhere('trip.end_date >= :endDateLower', {
        endDateLower: this.addDays(filters.endDate, -1),
      });
    }

    if (typeof filters.budget === 'number' && filters.budget > 0) {
      const budgetTolerance = Math.max(filters.budget * 0.25, 500000);
      qb.andWhere('trip.budget IS NOT NULL');
      qb.andWhere('trip.budget <= :budgetUpper', {
        budgetUpper: filters.budget + budgetTolerance,
      });
    }

    if (typeof filters.maxMembers === 'number') {
      qb.andWhere('trip.max_members >= :minFlexibleMembers', {
        minFlexibleMembers: Math.max(1, filters.maxMembers - 1),
      });
    }

    const trips = await qb.orderBy('trip.created_at', 'DESC').getMany();
    const stats = await this.loadTripStats(trips.map((trip) => trip.id));
    const hasSearchFilters = Boolean(
      filters.destination?.trim() ||
      filters.startDate ||
      filters.endDate ||
      typeof filters.budget === 'number' ||
      typeof filters.maxMembers === 'number',
    );

    return trips
      .map((trip) => ({
        trip,
        stats: stats.get(trip.id) ?? { currentMembers: 1, pendingRequests: 0 },
        score: hasSearchFilters
          ? this.scoreTripSearch(
              trip,
              stats.get(trip.id) ?? { currentMembers: 1, pendingRequests: 0 },
              filters,
            )
          : 0,
      }))
      .sort((left, right) => {
        if (!hasSearchFilters) return 0;
        if (right.score !== left.score) return right.score - left.score;
        return (
          new Date(right.trip.createdAt).getTime() -
          new Date(left.trip.createdAt).getTime()
        );
      })
      .map(({ trip, stats: tripStats }) =>
        this.toPublicTripWithStats(trip, tripStats),
      );
  }

  async findOne(id: string) {
    const trip = await this.tripsRepository.findOne({ where: { id } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  async findPublicOne(id: string) {
    const trip = await this.createPublicTripsQuery()
      .where('trip.id = :id', { id })
      .getOne();

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const stats = await this.loadTripStats([trip.id]);
    return this.toPublicTripWithStats(
      trip,
      stats.get(trip.id) ?? { currentMembers: 1, pendingRequests: 0 },
    );
  }

  async findCreatedByLeader(userId: string) {
    const trips = await this.createPublicTripsQuery()
      .where('trip.leader_id = :userId', { userId })
      .orderBy('trip.created_at', 'DESC')
      .getMany();
    const stats = await this.loadTripStats(trips.map((trip) => trip.id));

    return trips.map((trip) =>
      this.toPublicTripWithStats(
        trip,
        stats.get(trip.id) ?? { currentMembers: 1, pendingRequests: 0 },
      ),
    );
  }

  async findJoinedByUser(userId: string) {
    const memberships = await this.dataSource
      .getRepository(TripMember)
      .createQueryBuilder('member')
      .innerJoinAndSelect('member.trip', 'trip')
      .leftJoinAndSelect('trip.leader', 'leader')
      .where('member.user_id = :userId', { userId })
      .andWhere('member.role = :role', { role: MemberRole.MEMBER })
      .orderBy('member.joined_at', 'DESC')
      .getMany();

    const joinedStats = await this.loadTripStats(
      memberships.map((membership) => membership.trip.id),
    );
    const joinedTrips = memberships.map((membership) =>
      this.toPublicTripWithStats(
        membership.trip,
        joinedStats.get(membership.trip.id) ?? {
          currentMembers: 1,
          pendingRequests: 0,
        },
        { joinStatus: RequestStatus.APPROVED },
      ),
    );

    const joinedTripIds = new Set(joinedTrips.map((trip) => trip.id));
    const pendingOrRejectedRequests = await this.dataSource
      .getRepository(JoinRequest)
      .createQueryBuilder('request')
      .innerJoinAndSelect('request.trip', 'trip')
      .leftJoinAndSelect('trip.leader', 'leader')
      .where('request.user_id = :userId', { userId })
      .andWhere('request.status IN (:...statuses)', {
        statuses: [RequestStatus.PENDING, RequestStatus.REJECTED],
      })
      .orderBy('request.created_at', 'DESC')
      .getMany();

    const visibleRequests = pendingOrRejectedRequests.filter(
      (request) => !joinedTripIds.has(request.trip.id),
    );
    const requestStats = await this.loadTripStats(
      visibleRequests.map((request) => request.trip.id),
    );
    const requestTrips = visibleRequests.map((request) =>
      this.toPublicTripWithStats(
        request.trip,
        requestStats.get(request.trip.id) ?? {
          currentMembers: 1,
          pendingRequests: 0,
        },
        { joinStatus: request.status },
      ),
    );

    return [...joinedTrips, ...requestTrips];
  }

  async findRelation(tripId: string, userId: string) {
    const trip = await this.findOne(tripId);

    if (trip.leaderId === userId) {
      return {
        isLeader: true,
        isMember: true,
        joinStatus: RequestStatus.APPROVED,
      };
    }

    const member = await this.dataSource
      .getRepository(TripMember)
      .createQueryBuilder('member')
      .where('member.trip_id = :tripId', { tripId })
      .andWhere('member.user_id = :userId', { userId })
      .getOne();

    if (member) {
      return {
        isLeader: false,
        isMember: true,
        joinStatus: RequestStatus.APPROVED,
      };
    }

    const latestRequest = await this.dataSource
      .getRepository(JoinRequest)
      .createQueryBuilder('request')
      .where('request.trip_id = :tripId', { tripId })
      .andWhere('request.user_id = :userId', { userId })
      .orderBy('request.created_at', 'DESC')
      .getOne();

    return {
      isLeader: false,
      isMember: false,
      joinStatus: latestRequest?.status ?? null,
    };
  }

  async update(tripId: string, userId: string, dto: UpdateTripDto) {
    const trip = await this.findOne(tripId);

    this.assertLeader(trip, userId);

    if (trip.status !== TripStatus.UPCOMING) {
      throw new BadRequestException(
        'Chỉ có thể sửa trip ở trạng thái upcoming',
      );
    }

    if (this.hasTripStarted(trip)) {
      throw new BadRequestException('Trip đã bắt đầu');
    }

    const nextStartDate = dto.startDate ?? trip.startDate;
    const nextEndDate = dto.endDate ?? trip.endDate;
    this.validateTripDates(nextStartDate, nextEndDate);

    if (nextStartDate < this.getTodayDateString()) {
      throw new BadRequestException('Ngày khởi hành không được ở quá khứ');
    }

    if (dto.maxMembers !== undefined) {
      const stats = await this.loadTripStats([tripId]);
      const currentMembers = stats.get(tripId)?.currentMembers ?? 1;
      if (dto.maxMembers < currentMembers) {
        throw new BadRequestException(
          'Số thành viên tối đa không được nhỏ hơn số người hiện tại',
        );
      }
    }

    const updatePayload: Partial<Trip> = {};

    if (dto.destination !== undefined) {
      const destination = dto.destination.trim();
      if (!destination) {
        throw new BadRequestException('Vui lòng nhập địa điểm chuyến đi');
      }
      updatePayload.destination = destination;
    }
    if (dto.startDate !== undefined) updatePayload.startDate = dto.startDate;
    if (dto.endDate !== undefined) updatePayload.endDate = dto.endDate;
    if (dto.budget !== undefined) updatePayload.budget = dto.budget;
    if (dto.maxMembers !== undefined) updatePayload.maxMembers = dto.maxMembers;
    if (dto.description !== undefined) {
      updatePayload.description = dto.description.trim() || null;
    }

    if (Object.keys(updatePayload).length > 0) {
      await this.tripsRepository.update(tripId, updatePayload);
    }

    return this.findPublicOne(tripId);
  }

  async createJoinRequest(tripId: string, userId: string, message?: string) {
    const trip = await this.createPublicTripsQuery()
      .where('trip.id = :tripId', { tripId })
      .getOne();

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.leaderId === userId) {
      throw new BadRequestException('Bạn là leader của chuyến đi này');
    }

    this.validateTripIsBookable(trip);

    const stats = await this.loadTripStats([tripId]);
    const currentMembers = stats.get(tripId)?.currentMembers ?? 1;
    if (currentMembers >= trip.maxMembers) {
      throw new BadRequestException('Chuyến đi đã đủ thành viên');
    }

    const joinRequestRepository = this.dataSource.getRepository(JoinRequest);
    const member = await this.dataSource
      .getRepository(TripMember)
      .createQueryBuilder('member')
      .where('member.trip_id = :tripId', { tripId })
      .andWhere('member.user_id = :userId', { userId })
      .getOne();

    if (member) {
      throw new ConflictException('Bạn đã tham gia chuyến đi này');
    }

    const existingActiveRequest = await joinRequestRepository
      .createQueryBuilder('request')
      .where('request.trip_id = :tripId', { tripId })
      .andWhere('request.user_id = :userId', { userId })
      .andWhere('request.status IN (:...statuses)', {
        statuses: [RequestStatus.PENDING, RequestStatus.APPROVED],
      })
      .orderBy('request.created_at', 'DESC')
      .getOne();

    if (existingActiveRequest) {
      return {
        id: existingActiveRequest.id,
        status: existingActiveRequest.status,
      };
    }

    const requester = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: userId } });

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    const savedRequest = await joinRequestRepository.save(
      joinRequestRepository.create({
        trip: { id: tripId } as Trip,
        user: { id: userId } as User,
        message: message?.trim() || null,
        status: RequestStatus.PENDING,
      }),
    );

    await this.notificationsService.create({
      userId: trip.leaderId,
      type: NotificationType.TRIP_JOIN_REQUEST,
      title: 'Có yêu cầu tham gia mới',
      message: `${requester.full_name} muốn tham gia chuyến đi ${trip.destination}.`,
      targetUrl: `/trips/manage?tab=created&tripId=${trip.id}`,
      metadata: {
        tripId: trip.id,
        requestId: savedRequest.id,
        requesterId: userId,
      },
    });

    return {
      id: savedRequest.id,
      status: savedRequest.status,
    };
  }

  async findJoinRequests(tripId: string, userId: string) {
    const trip = await this.findOne(tripId);
    this.assertLeader(trip, userId);

    const requests = await this.dataSource
      .getRepository(JoinRequest)
      .createQueryBuilder('request')
      .innerJoinAndSelect('request.user', 'user')
      .where('request.trip_id = :tripId', { tripId })
      .andWhere('request.status = :status', { status: RequestStatus.PENDING })
      .orderBy('request.created_at', 'ASC')
      .getMany();

    return requests.map((request) => ({
      id: request.id,
      message: request.message,
      status: request.status,
      createdAt: request.created_at,
      user: {
        id: request.user.id,
        fullName: request.user.full_name,
        avatarUrl: request.user.avatar_url,
        trustScore: Number(request.user.trust_score),
      },
    }));
  }

  async approveJoinRequest(
    tripId: string,
    requestId: string,
    leaderId: string,
  ) {
    const request = await this.getPendingJoinRequestForLeader(
      tripId,
      requestId,
      leaderId,
    );
    const stats = await this.loadTripStats([tripId]);
    const currentMembers = stats.get(tripId)?.currentMembers ?? 1;

    if (currentMembers >= request.trip.maxMembers) {
      throw new BadRequestException('Chuyến đi đã đủ thành viên');
    }

    await this.dataSource.transaction(async (manager) => {
      request.status = RequestStatus.APPROVED;
      request.processedBy = { id: leaderId } as User;
      request.processed_at = new Date();
      await manager.getRepository(JoinRequest).save(request);

      const existingMember = await manager
        .getRepository(TripMember)
        .createQueryBuilder('member')
        .where('member.trip_id = :tripId', { tripId })
        .andWhere('member.user_id = :userId', { userId: request.user.id })
        .getOne();

      if (!existingMember) {
        await manager.getRepository(TripMember).save(
          manager.getRepository(TripMember).create({
            trip: { id: tripId } as Trip,
            user: { id: request.user.id } as User,
            role: MemberRole.MEMBER,
          }),
        );
      }
    });

    await this.notificationsService.create({
      userId: request.user.id,
      type: NotificationType.TRIP_JOIN_APPROVED,
      title: 'Yêu cầu tham gia đã được duyệt',
      message: `Bạn đã được duyệt vào chuyến đi ${request.trip.destination}.`,
      targetUrl: `/trips/manage?tab=joined&tripId=${request.trip.id}`,
      metadata: {
        tripId: request.trip.id,
        requestId: request.id,
      },
    });

    return { id: request.id, status: RequestStatus.APPROVED };
  }

  async rejectJoinRequest(tripId: string, requestId: string, leaderId: string) {
    const request = await this.getPendingJoinRequestForLeader(
      tripId,
      requestId,
      leaderId,
    );

    request.status = RequestStatus.REJECTED;
    request.processedBy = { id: leaderId } as User;
    request.processed_at = new Date();
    await this.dataSource.getRepository(JoinRequest).save(request);

    await this.notificationsService.create({
      userId: request.user.id,
      type: NotificationType.TRIP_JOIN_REJECTED,
      title: 'Yêu cầu tham gia chưa được duyệt',
      message: `Leader đã từ chối yêu cầu vào chuyến đi ${request.trip.destination}.`,
      targetUrl: `/trips/manage?tab=joined&tripId=${request.trip.id}`,
      metadata: {
        tripId: request.trip.id,
        requestId: request.id,
      },
    });

    return { id: request.id, status: RequestStatus.REJECTED };
  }

  async cancelOwnJoinRequest(tripId: string, userId: string) {
    const request = await this.dataSource
      .getRepository(JoinRequest)
      .createQueryBuilder('request')
      .where('request.trip_id = :tripId', { tripId })
      .andWhere('request.user_id = :userId', { userId })
      .andWhere('request.status = :status', { status: RequestStatus.PENDING })
      .orderBy('request.created_at', 'DESC')
      .getOne();

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đang chờ');
    }

    request.status = RequestStatus.CANCELED;
    request.processed_at = new Date();
    await this.dataSource.getRepository(JoinRequest).save(request);

    return { id: request.id, status: RequestStatus.CANCELED };
  }

  async findMembers(tripId: string, userId: string) {
    const trip = await this.createPublicTripsQuery()
      .where('trip.id = :tripId', { tripId })
      .getOne();

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const relation = await this.findRelation(tripId, userId);

    if (!relation.isLeader && !relation.isMember) {
      throw new ForbiddenException(
        'Bạn chưa phải thành viên của chuyến đi này',
      );
    }

    const members = await this.dataSource
      .getRepository(TripMember)
      .createQueryBuilder('member')
      .innerJoinAndSelect('member.user', 'user')
      .where('member.trip_id = :tripId', { tripId })
      .orderBy('member.role', 'ASC')
      .addOrderBy('member.joined_at', 'ASC')
      .getMany();

    const responses = members.map((member): TripMemberResponse => {
      return {
        id: member.id,
        userId: member.user.id,
        name: member.user.full_name,
        avatarUrl: member.user.avatar_url,
        trustScore: Number(member.user.trust_score),
        role:
          member.user.id === trip.leaderId ? MemberRole.LEADER : member.role,
        joinedAt: member.joined_at,
      };
    });

    const hasLeader = responses.some(
      (member) => member.userId === trip.leaderId,
    );
    if (!hasLeader && trip.leader) {
      responses.unshift({
        id: `leader-${trip.leader.id}`,
        userId: trip.leader.id,
        name: trip.leader.full_name,
        avatarUrl: trip.leader.avatar_url,
        trustScore: Number(trip.leader.trust_score),
        role: MemberRole.LEADER,
        joinedAt: trip.createdAt,
      });
    }

    return responses.sort((left, right) => {
      if (left.role === right.role) return 0;
      return left.role === MemberRole.LEADER ? -1 : 1;
    });
  }

  async removeMember(tripId: string, memberUserId: string, leaderId: string) {
    const trip = await this.findOne(tripId);
    this.assertLeader(trip, leaderId);

    if (memberUserId === leaderId) {
      throw new BadRequestException(
        'Leader không thể tự xóa mình khỏi chuyến đi',
      );
    }

    this.validateTripIsBookable(trip);

    const memberRepository = this.dataSource.getRepository(TripMember);
    const member = await memberRepository
      .createQueryBuilder('member')
      .innerJoinAndSelect('member.user', 'user')
      .where('member.trip_id = :tripId', { tripId })
      .andWhere('member.user_id = :memberUserId', { memberUserId })
      .getOne();

    if (!member || member.role === MemberRole.LEADER) {
      throw new NotFoundException('Không tìm thấy thành viên cần xóa');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(TripMember).delete({ id: member.id });
      await manager
        .getRepository(JoinRequest)
        .createQueryBuilder()
        .update(JoinRequest)
        .set({
          status: RequestStatus.CANCELED,
          processed_at: new Date(),
        })
        .where('trip_id = :tripId', { tripId })
        .andWhere('user_id = :memberUserId', { memberUserId })
        .andWhere('status = :status', { status: RequestStatus.APPROVED })
        .execute();
    });

    await this.notificationsService.create({
      userId: member.user.id,
      type: NotificationType.TRIP_MEMBER_REMOVED,
      title: 'Bạn đã bị xóa khỏi chuyến đi',
      message: `Leader đã xóa bạn khỏi chuyến đi ${trip.destination}.`,
      targetUrl: `/trips/${trip.id}`,
      metadata: { tripId: trip.id },
    });

    return { success: true };
  }

  async leaveTrip(tripId: string, userId: string) {
    const trip = await this.findOne(tripId);

    if (trip.leaderId === userId) {
      throw new BadRequestException(
        'Leader không thể rời chuyến đi của chính mình',
      );
    }

    this.validateTripIsBookable(trip);

    const member = await this.dataSource
      .getRepository(TripMember)
      .createQueryBuilder('member')
      .where('member.trip_id = :tripId', { tripId })
      .andWhere('member.user_id = :userId', { userId })
      .andWhere('member.role = :role', { role: MemberRole.MEMBER })
      .getOne();

    if (!member) {
      throw new NotFoundException('Bạn chưa tham gia chuyến đi này');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(TripMember).delete({ id: member.id });
      await manager
        .getRepository(JoinRequest)
        .createQueryBuilder()
        .update(JoinRequest)
        .set({ status: RequestStatus.CANCELED, processed_at: new Date() })
        .where('trip_id = :tripId', { tripId })
        .andWhere('user_id = :userId', { userId })
        .andWhere('status = :status', { status: RequestStatus.APPROVED })
        .execute();
    });

    return { success: true };
  }

  async completeByLeader(tripId: string, userId: string) {
    const trip = await this.findOne(tripId);
    this.assertLeader(trip, userId);

    if (trip.status === TripStatus.COMPLETED) {
      return this.findPublicOne(tripId);
    }

    if (trip.status === TripStatus.CANCELLED) {
      throw new BadRequestException('Không thể hoàn thành chuyến đi đã hủy');
    }

    await this.tripsRepository.update(tripId, {
      status: TripStatus.COMPLETED,
      leaderMarkedCompleted: true,
    });

    return this.findPublicOne(tripId);
  }

  async cancelByLeader(tripId: string, userId: string) {
    const trip = await this.findOne(tripId);

    this.assertLeader(trip, userId);

    if (trip.status === TripStatus.CANCELLED) {
      return this.findPublicOne(tripId);
    }

    if (trip.status !== TripStatus.UPCOMING || this.hasTripStarted(trip)) {
      throw new BadRequestException('Trip đã bắt đầu');
    }

    await this.tripsRepository.update(tripId, { status: TripStatus.CANCELLED });
    return this.findPublicOne(tripId);
  }

  async markCompletedByLeader(tripId: string, userId: string) {
    const trip = await this.findOne(tripId);

    if (trip.leaderId !== userId) {
      throw new ForbiddenException(
        'Only leader can mark this trip as completed',
      );
    }

    if (trip.status === TripStatus.CANCELLED) {
      throw new BadRequestException(
        'Cancelled trips cannot be marked completed',
      );
    }

    if (trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed trips cannot be marked completed again',
      );
    }

    if (![TripStatus.UPCOMING, TripStatus.ONGOING].includes(trip.status)) {
      throw new BadRequestException(
        'Only upcoming or ongoing trips can be marked completed',
      );
    }

    await this.tripsRepository.update(tripId, {
      status: TripStatus.AWAITING_CONFIRMATION,
    });

    return this.findOne(tripId);
  }

  async cancelByAdmin(tripId: string) {
    const trip = await this.findOne(tripId);

    if (trip.status === TripStatus.CANCELLED) {
      return this.findPublicOne(tripId);
    }

    await this.tripsRepository.update(tripId, { status: TripStatus.CANCELLED });
    return this.findPublicOne(tripId);
  }

  private async getPendingJoinRequestForLeader(
    tripId: string,
    requestId: string,
    leaderId: string,
  ) {
    const request = await this.dataSource
      .getRepository(JoinRequest)
      .createQueryBuilder('request')
      .innerJoinAndSelect('request.trip', 'trip')
      .innerJoinAndSelect('request.user', 'user')
      .where('request.id = :requestId', { requestId })
      .andWhere('request.trip_id = :tripId', { tripId })
      .getOne();

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu tham gia');
    }

    this.assertLeader(request.trip, leaderId);
    this.validateTripIsBookable(request.trip);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }

    return request;
  }
}
