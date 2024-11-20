import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

export enum NotificationType {
  SEND_GIFT = 'send_gift',

  CONNECTION_INVITATION = 'connection_invitation',
  CONNECTION_ACCEPTED = 'connection_accepted',
  SEND_MOTIVATION = 'send_motivation',
  SEND_APPLAUD = 'send_applaud',
  NO_SCHEDULED_FRIENDS = 'no_scheduled_friends', //general fire every 6hr, if no friends has scheduled session
  FRIENDS_IN_DANGER_ZONE = 'friends_in_danger_zone', //once they login fire every 2hr if friends in danger zone i.e below 25% of spiritual health
  FRIENDS_IN_APPLAUD_ZONE = 'friends_in_applaud_zone', //once they login fire every 4hr if friends in applaud zone i.e 100% of spiritual health
}

@Entity()
export class Notifications {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user!: User;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  read?: boolean = false;

  @Column({ type: 'text', nullable: true })
  meta_data?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
