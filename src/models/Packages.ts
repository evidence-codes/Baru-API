import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

export enum PackageStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity()
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  trackingID!: string;

  @ManyToOne(() => User, (user) => user.sentPackages, { nullable: false })
  sender!: User;

  @Column({ type: 'varchar', length: 255 })
  receiverName!: string;

  @Column({ type: 'varchar', length: 255 })
  receiverPhoneNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  category!: string;

  @Column({ type: 'varchar', length: 255 })
  packageName!: string;

  @Column({ type: 'float' })
  weight!: number;

  @Column({ type: 'float' })
  quantity!: number;

  @Column({ type: 'float' })
  value!: number;

  @Column({ type: 'varchar', nullable: true })
  preferredVehicle?: string;

  @Column({ type: 'varchar', length: 255 })
  pickupLocation!: string;

  @Column({ type: 'varchar', length: 255 })
  dropOffLocation!: string;

  @Column({ type: 'text', nullable: true })
  deliveryInstructions?: string;

  @Column({ type: 'float' })
  distance?: number;

  @Column({ type: 'float' })
  eta?: number;

  @Column({ type: 'float' })
  deliveryCost?: number;

  @Column({ type: 'enum', enum: PackageStatus, default: PackageStatus.PENDING })
  status: PackageStatus = PackageStatus.PENDING;

  @Column({ type: 'float', nullable: true })
  currentLatitude?: number;

  @Column({ type: 'float', nullable: true })
  currentLongitude?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  courierName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  courierPhoneNumber?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdatedAt: Date = new Date();

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}
