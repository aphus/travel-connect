import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TripMember } from './trip_member.entity';

export enum TripStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  LEGACY_IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export function normalizeTripStatus(status: TripStatus): TripStatus {
  return status === TripStatus.LEGACY_IN_PROGRESS ? TripStatus.ONGOING : status;
}

const decimalToNumberTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  destination!: string;

  @Column({ name: 'destination_place', type: 'varchar', length: 160, nullable: true })
  destinationPlace!: string | null;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalToNumberTransformer,
  })
  budget!: number | null;

  @Column({ name: 'max_members', type: 'int' })
  maxMembers!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.UPCOMING })
  status!: TripStatus;

  @Column({ name: 'leader_marked_completed', default: false })
  leaderMarkedCompleted!: boolean;

  @Column({ name: 'leader_id', type: 'uuid' })
  leaderId!: string;

  @Column({ name: 'cover_url', type: 'text', nullable: true })
  coverUrl!: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'leader_id' })
  leader!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => TripMember, (tripMember) => tripMember.trip)
  members!: TripMember[];
}
