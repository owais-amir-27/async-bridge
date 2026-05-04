import dotenv from 'dotenv';

// 1. Load the variables from the .env file into Node's process.env
dotenv.config();

// 2. Build a strongly-typed configuration object
export const config = {
  server: {
    // If process.env.PORT exists, use it. Otherwise, default to 3000.
    port: parseInt(process.env.PORT || '3000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  worker: {
    webhookUrl: process.env.WEBHOOK_RECEIVER_URL || 'http://localhost:3000/api/webhook-receiver',
    legacyWaitTime: parseInt(process.env.LEGACY_DB_WAIT_TIME_MS || '10000', 10),
  }
};

console.log('⚙️ Configuration Module Loaded');