import express from "express";
import dotenv from "dotenv";
import { connectRabbitMQ } from "./services/rabbitmq.service";
import router from "./routes/index";

dotenv.config();

const app = express();
app.use(express.json());
app.use(router);

connectRabbitMQ(); // Connect to RabbitMQ on startup

export default app;
