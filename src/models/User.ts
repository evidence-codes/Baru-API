import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Session } from './Session';
import { Connections } from './Connections';
import { SpiritualHealth } from './SpiritualHealth';
import { Notifications } from './Notifications';
import { Motivation } from './Motivation';
import { Applaud } from './Applaud';

export enum Roles {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
}
export enum Language {
  ENGLISH = 'en',
  UKRAINIAN = 'uk',
  GERMAN = 'de',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string = '';

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email!: string;

  @Column({ unique: true, type: 'varchar', length: 255, nullable: true })
  phoneNumber!: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: Date;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean = false;

  @Column({ type: 'enum', enum: Language, default: Language.ENGLISH })
  language?: string = Language.ENGLISH;

  @Column({ type: 'varchar', length: 255, nullable: true })
  theme?: string;

  @OneToMany(() => Notifications, (notification) => notification.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  notifications!: Notifications[];

  @OneToMany(() => SpiritualHealth, (spiritualHealth) => spiritualHealth.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  spiritualHealthRecords!: SpiritualHealth[];

  @Column({ type: 'int', default: 0 })
  totalPoints: number = 0;

  @Column({ type: 'int', default: 0 })
  totalApplauds: number = 0;

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role: Roles = Roles.USER;

  @Column({ type: 'boolean', default: false })
  hasRequestDelete: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePictureUrl?: string;

  @OneToMany(() => Motivation, (motivation) => motivation.sender, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  motivationsSent?: Motivation[];

  @OneToMany(() => Applaud, (applaud) => applaud.sender, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  applaudsSent?: Applaud[];

  @Column({ type: 'varchar', length: 255, default: 'UTC' })
  timezone: string = 'UTC';

  @Column({ type: 'varchar', length: 255, nullable: true })
  bio?: string;

  @OneToMany(() => Session, (session) => session.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  sessions!: Session[];

  @OneToMany(() => Connections, (connection) => connection.sender, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  sentConnections!: Connections[];

  @OneToMany(() => Connections, (connection) => connection.receiver, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  receivedConnections!: Connections[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date = new Date();

  // Dynamically added properties (optional)
  hasReceivedMotivation?: boolean;
  hasReceivedApplaud?: boolean;
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
