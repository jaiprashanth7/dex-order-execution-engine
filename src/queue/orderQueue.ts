import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

export interface OrderJobData {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

// ---- IMPORTANT PART ----
// Use the REDIS_URL directly.
// Render gives a URL like:
// rediss://default:PASSWORD@HOST:PORT
// -------------------------
const connection = new IORedis(config.redisUrl!, {
  maxRetriesPerRequest: null,
  tls: config.redisUrl?.startsWith('rediss://') ? {} : undefined
});

export const orderQueue = new Queue<OrderJobData>('orders', { connection });
