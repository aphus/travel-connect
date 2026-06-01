import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  TRIP_JOIN_REQUEST = 'TRIP_JOIN_REQUEST',
  TRIP_JOIN_APPROVED = 'TRIP_JOIN_APPROVED',
  TRIP_JOIN_REJECTED = 'TRIP_JOIN_REJECTED',
  TRIP_MEMBER_REMOVED = 'TRIP_MEMBER_REMOVED',
  NEW_REVIEW = 'NEW_REVIEW',
  TRIP_AWAITING_CONFIRMATION = 'TRIP_AWAITING_CONFIRMATION',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'target_url', type: 'varchar', length: 255, nullable: true })
  targetUrl!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
