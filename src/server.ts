import 'reflect-metadata';

import { v2 as cloudinary } from 'cloudinary';

import http from 'http';

import app from './app';

import { config } from './config/config';

import AppDataSource from './ormconfig';

import { Server } from 'socket.io';

// import redisConnect from './helper/redisConnect';
const server = http.createServer(app);
export const io = new Server(server);

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  socket.join(userId);
});

const PORT = process.env.PORT || 8080;
// Connect to the database and sync models
AppDataSource.initialize()
  .then(async () => {
    // await redisConnect();
    console.log('Database connected successfully!');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit if the database connection fails
  });
