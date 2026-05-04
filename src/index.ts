import express from 'express';
import { Redis } from 'ioredis';
import './queue/index.js';   
import './workers/index.js'; 
import { apiRouter } from './api/index.js';
import { config } from './config/index.js';

const app = express();


app.use(express.json());
app.use('/api', apiRouter);


// Connect to Redis (typically local Docker in development).
const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

// Helpful startup signal so you can tell Redis is reachable.
redis.on('connect', () => {
  console.log('[redis] connected');
});

// Simple health-check route for smoke tests.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AsyncBridge is alive and listening.' });
});

// Start the Express server.
app.listen(config.server.port, () => {
  console.log(`[server] listening on http://localhost:${config.server.port}`);
});