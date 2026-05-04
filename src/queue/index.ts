import { Queue } from 'bullmq';
import {Redis} from 'ioredis';
import { config } from '../config/index.js';

// Shared Redis connection for BullMQ.
const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null, 
});

// Create the queue used to hand off work to the worker.
export const legacyQueue = new Queue('legacy-api-queue', {
  connection: redisConnection,
});

console.log('[queue] ready: legacy-api-queue');