import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

export interface OrderJobData {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

// Use Redis internal URL directly.
// DO NOT USE TLS for redis:// connections.
const connection = new IORedis(config.redisUrl!, {
  maxRetriesPerRequest: null,
  // 🚫 No TLS for internal Redis
});

export const orderQueue = new Queue<OrderJobData>('orders', { connection });
