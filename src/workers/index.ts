import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import axios from 'axios'; // Used to POST the webhook callback
import { config } from '../config/index.js';

const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
});

// Simple helper for simulating slow/legacy work in this demo.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const legacyWorker = new Worker(
  'legacy-api-queue',
  async (job) => {
    console.log(`\n[worker] picked up job ${job.id}`);
    const { query, user } = job.data; // Data originally sent by the API route

    console.log(`   [legacy] simulating slow database call...`);
    await sleep(config.worker.legacyWaitTime); // Simulate a 10-second legacy/database delay

    // 1) Build the final result payload.
    const finalData = {
      status: 'success',
      accountHolder: user,
      mortgageBalance: '$250,000',
      timestamp: new Date().toISOString()
    };
    console.log(`   [worker] job ${job.id} completed`);

    // 2) Cache the result in Redis.
    // We key by user for this demo.
    // 'EX', 3600 means it expires in 1 hour (3600 seconds).
    await redisConnection.set(`cache:${user}`, JSON.stringify(finalData), 'EX', 3600);
    console.log(`   [cache] stored result for 1 hour`);

    // 3) Notify the caller via webhook.
    // Axios POSTs the final payload to the local webhook receiver endpoint.
    try {
      await axios.post(config.worker.webhookUrl, {
        jobId: job.id,
        result: finalData
      });
      console.log(`   [webhook] delivered callback`);
    } catch (error) {
      // BullMQ/axios errors are usually `Error`, but handle unknown throwables too.
      if (error instanceof Error) {
        console.error(`   [webhook] delivery failed:`, error.message);
      } else {
        // If it was something odd (string/number/etc), log a safe string version.
        console.error(`   [webhook] delivery failed:`, String(error));
      }
    }

    return finalData;
  },
  { connection: redisConnection }
);

console.log('[worker] waiting for jobs...');