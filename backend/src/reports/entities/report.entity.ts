import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Trip } from '../../trips/entities/trip.entity';

export enum ReportReason {
  SPAM = 'spam',
  SCAM = 'scam',
  TOXIC = 'toxic',
  CANCEL_LAST_MINUTE = 'cancel_last_minute',
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  trip_id!: string;

  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column()
  reporter_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @Column()
  reported_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_id' })
  reported!: User;

  @Column({ type: 'varchar', length: 100 })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status!: ReportStatus;

  @Column({ type: 'text', nullable: true })
  admin_note!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
