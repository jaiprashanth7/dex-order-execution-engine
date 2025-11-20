import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

const connection = new IORedis({
  host: config.redis.host,                     // from REDIS_HOST
  port: config.redis.port,                     // from REDIS_PORT
  password: process.env.REDIS_PASSWORD, // from REDIS_PASSWORD (Railway Redis)
  //password: config.redis.password,
//   password: process.env.REDIS_PASSWORD,   
  maxRetriesPerRequest: null,                  // required by BullMQ v5
  // if your Railway Redis requires TLS, set REDIS_TLS=1 in env and this will enable it
  tls: process.env.REDIS_TLS === '1' ? {} : undefined
});

export interface OrderJobData {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

export const orderQueue = new Queue<OrderJobData>('orders', { connection });
