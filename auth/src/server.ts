import "reflect-metadata";

import { v2 as cloudinary } from "cloudinary";

import http from "http";

import app from "./app";

import { config } from "./config/config";

import AppDataSource from "./ormconfig";

import { Server } from "socket.io";

// import { PackageRepository as Package } from './ormconfig';

interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  trackingID: string; // Package the driver is delivering
}

// import redisConnect from './helper/redisConnect';
const server = http.createServer(app);
export const io = new Server(server);

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Listen for location updates from the driver's app
//   socket.on('driver-location-update', async (data: DriverLocation) => {
//     console.log('Received location update:', data);

//     // Optionally save the location in the database
//     const pkg = await Package.findOne({
//       where: { trackingID: data.trackingID },
//     });
//     if (pkg) {
//       pkg.currentLatitude = data.latitude;
//       pkg.currentLongitude = data.longitude;
//       pkg.lastUpdatedAt = new Date();
//       await Package.save(pkg);
//     }

//     // Broadcast the location update to clients tracking the package
//     io.to(data.trackingID).emit('location-update', {
//       driverId: data.driverId,
//       latitude: data.latitude,
//       longitude: data.longitude,
//     });
//   });

//   // Clean up when a user disconnects
//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);
//   });
// });

const PORT = process.env.PORT || 8080;
// Connect to the database and sync models
AppDataSource.initialize()
  .then(async () => {
    // await redisConnect();
    console.log("Database connected successfully!");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit if the database connection fails
  });
