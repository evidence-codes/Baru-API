import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Notifications } from './Notifications';
import { Package } from './Packages';
import { CourierDetails } from './Courier';

export enum Roles {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
  DISPATCHER = 'dispatcher',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string = '';

  @Column({ unique: true, type: 'varchar', length: 255 })
  email!: string;

  @Column({ unique: true, type: 'varchar', length: 255, nullable: true })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  theme?: string;

  @OneToMany(() => Notifications, (notification) => notification.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  notifications!: Notifications[];

  @OneToMany(() => Package, (pkg) => pkg.sender, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  sentPackages!: Package[];

  @OneToOne(() => CourierDetails, (courierDetails) => courierDetails.user)
  courierDetails!: CourierDetails;

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role: Roles = Roles.USER;

  @Column({ type: 'boolean', default: false })
  hasRequestDelete: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePictureUrl?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date = new Date();
}

// Use the UserSelectFields type to enforce typing on selected fields
export const UserSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  profilePictureUrl: true,
  timezone: true,
  totalPoints: true,
  totalApplauds: true,
};
