import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly profileCompletedMessage =
    'Vui lòng hoàn thiện hồ sơ tin cậy trước khi thực hiện hành động này.';

  toPrivateUser(user: User) {
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
      phone_verified: user.phone_verified,
      identity_verified: user.identity_verified,
      profile_completed: user.profile_completed,
      created_at: user.created_at,
      updated_at: user.updated_at,
      bio: user.bio,
    };
  }

  toPublicUser(user: User) {
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
      phone_verified: user.phone_verified,
      identity_verified: user.identity_verified,
      profile_completed: user.profile_completed,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
    const updateData = this.buildProfileUpdateData(dto);

    if (Object.keys(updateData).length > 0) {
      await this.usersRepository.update(userId, updateData);
    }

    const updated = await this.findById(userId);
    const completionData = {
      phone_verified: Boolean(updated.phone_number),
      profile_completed: this.isProfileCompleted(updated),
    };

    if (
      completionData.phone_verified !== updated.phone_verified ||
      completionData.profile_completed !== updated.profile_completed
    ) {
      await this.usersRepository.update(userId, completionData);
      Object.assign(updated, completionData);
    }

    return this.toPrivateUser(updated);
  }

  async getPrivateById(userId: string) {
    const user = await this.findById(userId);
    return this.toPrivateUser(user);
  }

  async getPublicById(userId: string) {
    const user = await this.findById(userId);
    return this.toPublicUser(user);
  }

  isProfileCompleted(user: User) {
    return Boolean(
      user.full_name?.trim() &&
      user.avatar_url?.trim() &&
      user.phone_number?.trim() &&
      user.date_of_birth &&
      user.city?.trim() &&
      user.emergency_contact_phone?.trim(),
    );
  }

  async assertProfileCompleted(userId: string) {
    const user = await this.findById(userId);
    const profileCompleted = user.profile_completed && this.isProfileCompleted(user);

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
}
