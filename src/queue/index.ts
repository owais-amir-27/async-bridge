import { Queue } from 'bullmq';
import {Redis} from 'ioredis';

// Shared Redis connection for BullMQ.
const redisConnection = new Redis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null, // BullMQ requires this specific setting to work properly
});

// Create the queue used to hand off work to the worker.
export const legacyQueue = new Queue('legacy-api-queue', {
  connection: redisConnection,
});

console.log('[queue] ready: legacy-api-queue');