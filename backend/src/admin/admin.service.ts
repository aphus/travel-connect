import { Injectable } from '@nestjs/common';
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
      ],
    });
  }

  listTrips() {
    return this.tripsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  listReports() {
    return this.reportsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  banUser(userId: string) {
    return this.usersService.banUser(userId, true);
  }

  cancelTrip(tripId: string) {
    return this.tripsService.cancelByAdmin(tripId);
  }
}
