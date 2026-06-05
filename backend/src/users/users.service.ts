import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { JoinRequest, RequestStatus } from '../trips/entities/join_request.entity';
import { TripMember } from '../trips/entities/trip_member.entity';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';

type TripReliability = {
  completed_trips: number;
  created_trips: number;
  cancelled_trips: number;
  left_trips: number;
  kicked_trips: number;
  total_tracked_trips: number;
  completion_rate: number;
  cancel_leave_rate: number;
  kick_rate: number;
};

const LEFT_TRIP_MESSAGE = '__TRIPCONNECT_LEFT_TRIP__';
const DEMO_PHONE_OTP = '123456';

@Injectable()
export class UsersService {
  private readonly profileCompletedMessage =
    'Vui lòng hoàn thiện hồ sơ tin cậy trước khi thực hiện hành động này.';

  toPrivateUser(user: User) {
    const profileCompleted = this.isProfileCompleted(user);
    const phoneVerified = Boolean(user.phone_number?.trim() && user.phone_verified);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      is_banned: user.is_banned,
      banned_until: user.banned_until,
      trust_score: Number(user.trust_score),
      trips_created: user.tripsCreated,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      city: user.city,
      emergency_contact_name: user.emergency_contact_name,
      emergency_contact_phone: user.emergency_contact_phone,
      travel_style: user.travel_style,
      travel_preferences: user.travel_preferences,
      email_verified: user.email_verified,
      phone_verified: phoneVerified,
      identity_verified: user.identity_verified,
      profile_completed: profileCompleted,
      created_at: user.created_at,
      updated_at: user.updated_at,
      bio: user.bio,
    };
  }

  toPublicUser(user: User) {
    const profileCompleted = this.isProfileCompleted(user);
    const phoneVerified = Boolean(user.phone_number?.trim() && user.phone_verified);

    return {
      id: user.id,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      role: user.role,
      is_banned: user.is_banned,
      trust_score: Number(user.trust_score),
      trips_created: user.tripsCreated,
      city: user.city,
      gender: user.gender,
      travel_style: user.travel_style,
      travel_preferences: user.travel_preferences,
      email_verified: user.email_verified,
      phone_verified: phoneVerified,
      identity_verified: user.identity_verified,
      profile_completed: profileCompleted,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(JoinRequest)
    private readonly joinRequestsRepository: Repository<JoinRequest>,
  ) { }

  findAll() {
    return this.usersRepository.find({
      order: { created_at: 'DESC' },
      select: [
        'id',
        'email',
        'full_name',
        'avatar_url',
        'role',
        'is_banned',
        'trust_score',
        'tripsCreated',
        'created_at',
      ],
    });
  }

  async getTopTrustedLeaders(limit: number = 5) {
    const leaders = await this.usersRepository.find({
      where: { is_banned: false },
      order: { trust_score: 'DESC', tripsCreated: 'DESC' },
      take: limit,
      select: ['id', 'full_name', 'avatar_url', 'trust_score', 'tripsCreated'],
    });
    return leaders;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  create(userData: Partial<User>) {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const current = await this.findById(userId);
    const updateData = this.buildProfileUpdateData(dto);

    if (dto.phone_number !== undefined) {
      const nextPhoneNumber = this.normalizeOptionalString(dto.phone_number);
      if (nextPhoneNumber !== current.phone_number) {
        updateData.phone_verified = false;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.usersRepository.update(userId, updateData);
    }

    const updated = await this.findById(userId);
    const completionData = {
      profile_completed: this.isProfileCompleted(updated),
    };

    if (completionData.profile_completed !== updated.profile_completed) {
      await this.usersRepository.update(userId, completionData);
      Object.assign(updated, completionData);
    }

    return this.toPrivateUser(updated);
  }

  async sendPhoneOtp(dto: SendPhoneOtpDto) {
    this.assertOtpMockAvailable();
    const phoneNumber = this.normalizeOptionalString(dto.phone_number);

    if (!phoneNumber) {
      throw new BadRequestException('Vui lòng nhập số điện thoại.');
    }

    return { message: 'Mã OTP đã được gửi.' };
  }

  async verifyPhoneOtp(userId: string, dto: VerifyPhoneOtpDto) {
    this.assertOtpMockAvailable();
    const phoneNumber = this.normalizeOptionalString(dto.phone_number);

    if (!phoneNumber) {
      throw new BadRequestException('Vui lòng nhập số điện thoại.');
    }

    if (dto.code?.trim() !== DEMO_PHONE_OTP) {
      throw new BadRequestException('Mã OTP không chính xác.');
    }

    const user = await this.findById(userId);
    user.phone_number = phoneNumber;
    user.phone_verified = true;
    user.profile_completed = this.isProfileCompleted(user);

    await this.usersRepository.update(userId, {
      phone_number: user.phone_number,
      phone_verified: user.phone_verified,
      profile_completed: user.profile_completed,
    });

    return this.toPrivateUser(user);
  }

  async getPrivateById(userId: string) {
    const user = await this.findById(userId);
    return this.toPrivateUser(user);
  }

  async getPublicById(userId: string) {
    const user = await this.findById(userId);
    return {
      ...this.toPublicUser(user),
      trip_reliability: await this.getTripReliability(userId),
    };
  }

  isProfileCompleted(user: User) {
    return Boolean(
      user.full_name?.trim() &&
      user.avatar_url?.trim() &&
      user.phone_number?.trim() &&
      user.phone_verified &&
      user.date_of_birth &&
      user.city?.trim() &&
      user.emergency_contact_phone?.trim(),
    );
  }

  async assertProfileCompleted(userId: string) {
    const user = await this.findById(userId);
    const profileCompleted = this.isProfileCompleted(user);

    if (!profileCompleted) {
      throw new ForbiddenException(this.profileCompletedMessage);
    }
  }

  assertCanCreateTrip(userId: string) {
    return this.assertProfileCompleted(userId);
  }

  assertCanJoinTrip(userId: string) {
    return this.assertProfileCompleted(userId);
  }

  async banUser(userId: string, isBanned = true) {
    await this.usersRepository.update(userId, { is_banned: isBanned });
    return this.findById(userId);
  }

  private buildProfileUpdateData(dto: UpdateProfileDto): DeepPartial<User> {
    const updateData: Record<string, string | null> = {};
    const stringFields: (keyof UpdateProfileDto)[] = [
      'full_name',
      'avatar_url',
      'bio',
      'phone_number',
      'gender',
      'city',
      'emergency_contact_name',
      'emergency_contact_phone',
      'travel_style',
      'travel_preferences',
    ];

    for (const field of stringFields) {
      if (dto[field] !== undefined) {
        updateData[field] = this.normalizeOptionalString(dto[field]);
      }
    }

    if (dto.date_of_birth !== undefined) {
      updateData.date_of_birth = this.normalizeOptionalString(dto.date_of_birth);
    }

    return updateData as DeepPartial<User>;
  }

  private normalizeOptionalString(value: string) {
    const trimmed = value.trim();
    return trimmed || null;
  }

  private assertOtpMockAvailable() {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'OTP mock chỉ được dùng trong môi trường development.',
      );
    }
  }

  private async getTripReliability(userId: string): Promise<TripReliability> {
    const [
      completedTrips,
      createdTrips,
      cancelledTrips,
      leftTrips,
      kickedTrips,
    ] = await Promise.all([
      this.countCompletedTripsForUser(userId),
      this.tripsRepository.count({ where: { leaderId: userId } }),
      this.tripsRepository.count({
        where: { leaderId: userId, status: TripStatus.CANCELLED },
      }),
      this.countLeftTripsForUser(userId),
      this.countKickedTripsForUser(userId),
    ]);

    const totalTrackedTrips =
      completedTrips + cancelledTrips + leftTrips + kickedTrips;

    return {
      completed_trips: completedTrips,
      created_trips: createdTrips,
      cancelled_trips: cancelledTrips,
      left_trips: leftTrips,
      kicked_trips: kickedTrips,
      total_tracked_trips: totalTrackedTrips,
      completion_rate: this.toRate(completedTrips, totalTrackedTrips),
      cancel_leave_rate: this.toRate(
        cancelledTrips + leftTrips,
        totalTrackedTrips,
      ),
      kick_rate: this.toRate(kickedTrips, totalTrackedTrips),
    };
  }

  private async countCompletedTripsForUser(userId: string) {
    const result = await this.tripsRepository
      .createQueryBuilder('trip')
      .leftJoin(TripMember, 'member', 'member.trip_id = trip.id')
      .select('COUNT(DISTINCT trip.id)', 'count')
      .where('trip.status = :status', { status: TripStatus.COMPLETED })
      .andWhere(
        new Brackets((qb) => {
          qb.where('trip.leader_id = :userId', { userId }).orWhere(
            'member.user_id = :userId',
            { userId },
          );
        }),
      )
      .getRawOne<{ count: string }>();

    return Number(result?.count ?? 0);
  }

  private countLeftTripsForUser(userId: string) {
    // Mirrors TripsService leave tracking: a self-left approved request is canceled with this marker.
    return this.joinRequestsRepository
      .createQueryBuilder('request')
      .where('request.user_id = :userId', { userId })
      .andWhere('request.status = :status', { status: RequestStatus.CANCELED })
      .andWhere(
        new Brackets((qb) => {
          qb.where('request.message = :leftMessage', {
            leftMessage: LEFT_TRIP_MESSAGE,
          }).orWhere('request.processed_by = :userId', { userId });
        }),
      )
      .getCount();
  }

  private countKickedTripsForUser(userId: string) {
    // Mirrors TripsService remove tracking: leader removal cancels the approved request with processed_by != user.
    return this.joinRequestsRepository
      .createQueryBuilder('request')
      .where('request.user_id = :userId', { userId })
      .andWhere('request.status = :status', { status: RequestStatus.CANCELED })
      .andWhere('request.processed_by IS NOT NULL')
      .andWhere('request.processed_by != :userId', { userId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('request.message IS NULL').orWhere(
            'request.message != :leftMessage',
            { leftMessage: LEFT_TRIP_MESSAGE },
          );
        }),
      )
      .getCount();
  }

  private toRate(value: number, total: number) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}
