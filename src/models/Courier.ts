import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class CourierDetails {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'varchar', length: 255 })
  licenseNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  licenseExpiry!: string;

  @Column({ type: 'varchar', length: 255 })
  vehicleType!: string;

  @Column({ type: 'varchar', length: 255 })
  vehicleMake!: string;

  @Column({ type: 'varchar', length: 255 })
  vehicleModel!: string;

  @Column({ type: 'varchar', length: 255 })
  vehicleYear!: string;

  @Column({ type: 'varchar', length: 255 })
  vehicleColor!: string;

  // Profile picture URL (optional, if you need to store it)
  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePictureUrl?: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn() // This sets the foreign key in CourierDetails to User
  user!: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date = new Date();
}
