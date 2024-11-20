// src/worker.ts
import 'reflect-metadata';

import { reminderQueue } from './queues/reminderQueue';

import AppDataSource from './ormconfig';
import { pointDeductionQueue } from './queues/pointDeductionQueue';

import './queues';
import {
  connectionSyncQueue,
  scheduleDailyConnectionSync,
} from './queues/connectionSyncResetQueue';
import {
  noConnectionSessionScheduledQueue,
  scheduleNoConnectionSessionJob,
} from './queues/NoSessionScheduleQueue';
// Initialize the database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Worker connected to the database');

    scheduleDailyConnectionSync();
    scheduleNoConnectionSessionJob().catch(console.error);
  })
  .catch((error) => console.error('TypeORM connection error:', error));

// Set up event listeners for the queue
reminderQueue.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`);
});

reminderQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} has failed with error ${err.message}`);
});

pointDeductionQueue.on('completed', (job) => {
  console.log(`pointDeductionQueue Job ${job.id} has been completed`);
});

pointDeductionQueue.on('failed', (job, err) => {
  console.error(
    `pointDeductionQueue Job ${job.id} has failed with error ${err.message}    `,
  );
});

connectionSyncQueue.on('completed', (job) => {
  console.log(`connectionSyncQueue Job ${job.id} has been completed`);
});

connectionSyncQueue.on('failed', (job, err) => {
  console.error(
    `connectionSyncQueue Job ${job.id} has failed with error ${err.message}    `,
  );
});
noConnectionSessionScheduledQueue.on('completed', (job) => {
  console.log(`noConnectionSessionScheduled Job ${job.id} has been completed`);
});

noConnectionSessionScheduledQueue.on('failed', (job, err) => {
  console.error(
    `noConnectionSessionScheduled Job ${job.id} has failed with error ${err.message}    `,
  );
});

console.log('Worker is running...');
