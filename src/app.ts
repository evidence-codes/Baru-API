// your-project-name/src/app.ts

import express from 'express';
import router from './routes/index.routes';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import listEndpoints from 'list_end_points';
import { generalError, notFound } from './middlewares/error.handler';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { reminderQueue } from './queues/reminderQueue';

import { pointDeductionQueue } from './queues/pointDeductionQueue';
import { achievementQueue } from './queues/achievementQueue';
import { giftQueue } from './queues/giftQueue';
import { notificationQueue } from './queues/notificationQueue';
import { otpQueue } from './queues/otpQueue';
import { spiritualHealthUserCreationQueue } from './queues/ConnectionSpiritualHealthQueue';
import { connectionSyncQueue } from './queues/connectionSyncResetQueue';
import { noConnectionSessionScheduledQueue } from './queues/NoSessionScheduleQueue';

const app = express();

// Middleware

app.use(cors());
app.use(helmet()); // Helps set various HTTP headers to bolster security
app.use(compression()); // Compresses response bodies for improved performance

app.set('trust proxy', 1); // trust first proxy

// Set up request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Using 'dev' format for logging in development mode
} else {
  app.use(morgan('combined'));
}

// Set up rate limiter: max 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 1 * 30 * 1000, // 1 minute
  max: 100,
});
app.use('/api/', limiter); // Applying rate limiting to /api/ routes

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', router);
app.get('/', (_req, res) => res.json({ message: 'Server is Up' }));

if (process.env.NODE_ENV === 'development') {
  listEndpoints(app);
}

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/bull/queues');

createBullBoard({
  queues: [
    reminderQueue && new BullAdapter(reminderQueue),

    achievementQueue && new BullAdapter(achievementQueue),
    pointDeductionQueue && new BullAdapter(pointDeductionQueue),
    otpQueue && new BullAdapter(otpQueue),
    giftQueue && new BullAdapter(giftQueue),
    notificationQueue && new BullAdapter(notificationQueue),
    spiritualHealthUserCreationQueue &&
      new BullAdapter(spiritualHealthUserCreationQueue),
    connectionSyncQueue && new BullAdapter(connectionSyncQueue),
    noConnectionSessionScheduledQueue &&
      new BullAdapter(noConnectionSessionScheduledQueue),
  ].filter(Boolean), // Remove any undefined adapters
  serverAdapter,
});

app.use('/bull/queues', serverAdapter.getRouter());

app.use(notFound);
app.use(generalError);

export default app;
