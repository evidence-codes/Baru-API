// src/redisConnection.ts
import { createClient } from 'redis';
import { config } from '../config/config';

const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: Number(config.redis.port),
  },
  password: config.redis.password,
});

// Connect once and handle errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient
  .connect()
  .then(() => console.log('Connected to Redis successfully'))
  .catch((error) => console.error('Error connecting to Redis:', error));

export default redisClient;
