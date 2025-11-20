import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

// const connection = new IORedis({
//   host: config.redis.host,
//   port: config.redis.port,
//   password: config.redis.password,
//   tls: config.redis.tls,
//   maxRetriesPerRequest: null
// });
const connection = new IORedis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null,
  });

export interface OrderJobData {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

export const orderQueue = new Queue<OrderJobData>('orders', { connection });