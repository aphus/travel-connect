import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      trust_score: user.trust_score,
      tripsCreated: user.tripsCreated,
      role: user.role,
      is_banned: user.is_banned,
      created_at: user.created_at,
      updated_at: user.updated_at,
      bio: user.bio,
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
    await this.usersRepository.update(userId, dto);
    const updated = await this.findById(userId);

    return this.toPublicUser(updated);
  }

  async getPublicById(userId: string) {
    const user = await this.findById(userId);
    return this.toPublicUser(user);
  }

  async banUser(userId: string, isBanned = true) {
    await this.usersRepository.update(userId, { is_banned: isBanned });
    return this.findById(userId);
  }
}
