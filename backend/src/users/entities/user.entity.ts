import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  full_name!: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone_number!: string | null;

  @Column({ type: 'date', nullable: true })
  date_of_birth!: string | null;

  @Column({ type: 'varchar', nullable: true })
  gender!: string | null;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', nullable: true })
  emergency_contact_name!: string | null;

  @Column({ type: 'varchar', nullable: true })
  emergency_contact_phone!: string | null;

  @Column({ type: 'varchar', nullable: true })
  travel_style!: string | null;

  @Column({ type: 'text', nullable: true })
  travel_preferences!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ default: false })
  is_banned!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  banned_until!: Date | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  trust_score!: number;

  @Column({ name: 'trips_created', type: 'int', default: 0 })
  tripsCreated!: number;

  @Column({ default: true })
  email_verified!: boolean;

  @Column({ default: false })
  phone_verified!: boolean;

  @Column({ default: false })
  identity_verified!: boolean;

  @Column({ default: false })
  profile_completed!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
