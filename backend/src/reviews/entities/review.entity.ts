import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
@Unique(['trip_id', 'reviewer_id', 'reviewee_id'])
@Check('"rating" >= 1 AND "rating" <= 5')
@Check('"reviewer_id" <> "reviewee_id"')
@Index(['reviewee_id'])
@Index(['reviewer_id'])
@Index(['trip_id'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  trip_id!: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({ type: 'uuid' })
  reviewer_id!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: User;

  @Column({ type: 'uuid' })
  reviewee_id!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reviewee_id' })
  reviewee!: User;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
