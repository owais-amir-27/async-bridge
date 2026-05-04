import { Router } from 'express';
import { legacyQueue } from '../queue/index.js';
import { Redis } from 'ioredis';

export const apiRouter = Router();
const redis = new Redis({ host: '127.0.0.1', port: 6379 }); // Shared Redis connection for cache lookups

apiRouter.post('/fetch-data', async (req, res) => {
  try {
    const orderData = req.body; 
    const { user } = orderData; // Identify the request (used for cache key + logging)
    console.log(`\n[api] /fetch-data received for user: ${user}`);

    // Fast path: check Redis cache first.
    const cachedData = await redis.get(`cache:${user}`);
    
    if (cachedData) {
      console.log(`   [cache] hit; returning cached response`);
      // Cached response means we can skip the queue/worker entirely.
      res.status(200).json(JSON.parse(cachedData));
      return; // Stop the code here so we don't add it to the queue
    }

    // Cache miss: enqueue the work and return a job id immediately.
    const job = await legacyQueue.add('legacy-query', orderData);

    res.status(202).json({
      message: 'Request accepted. The chef is working on it.',
      jobId: job.id,
      status: 'queued'
    });

  } catch (error) {
    console.error('[api] /fetch-data failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Webhook receiver used for local testing/demo purposes.
apiRouter.post('/webhook-receiver', (req, res) => {
  console.log(`\n[webhook] received callback`);
  console.log(`[webhook] payload:`, req.body);
  
  res.status(200).send('React app received the webhook successfully!');
});