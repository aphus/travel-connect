import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Trip } from './trip.entity';

export enum MemberRole {
    LEADER = 'LEADER',
    MEMBER = 'MEMBER',
}

@Entity('trip_members')
@Unique('unique_trip_user', ['trip', 'user'])
export class TripMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
    role: MemberRole;

    @CreateDateColumn()
    joined_at: Date;
}