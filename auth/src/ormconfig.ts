import { DataSource } from "typeorm";
import { config } from "./config/config";
import { User } from "./models/User";

const AppDataSource = new DataSource({
  type: "postgres",
  url: config.db.uri,
  // synchronize: true,
  // logging: false,
  // logging: ['query', 'error'],
  entities: [User], // Load entities dynamically
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
