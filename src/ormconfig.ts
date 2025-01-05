import { DataSource } from 'typeorm';
import { config } from './config/config';
import { User } from './models/User';
// import { Session } from './models/Session';
// import { Reminder } from './models/Reminder';
// import { SpiritualHealth } from './models/SpiritualHealth';
// import { Connections } from './models/Connections';
import { Notifications } from './models/Notifications';
import { Package } from './models/Packages';
import { CourierDetails } from './models/Courier';
// import { Gift } from './models/Gift';
// import { Motivation } from './models/Motivation';
// import { Applaud } from './models/Applaud';

// Get the directory path where entities are stored

const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.db.uri,
  // synchronize: true,
  // logging: false,
  // logging: ['query', 'error'],
  entities: [User, Package, Notifications, CourierDetails], // Load entities dynamically
  synchronize: true,
  // migrations: ['src/migration/**/*.ts'],
  subscribers: [],
  // ...(config.node_env === 'development' && {
  //   logging: true,
  //   logger: 'advanced-console',
  // }),
});

export default AppDataSource;
export const UserRepository = AppDataSource.getRepository(User);
export const PackageRepository = AppDataSource.getRepository(Package);
export const NotificationsRepository =
  AppDataSource.getRepository(Notifications);
export const CourierRepository = AppDataSource.getRepository(CourierDetails);
