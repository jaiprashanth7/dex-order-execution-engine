import { Worker, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { dexRouter } from '../services/dexRouter';
import { sendOrderStatus } from '../websocket/orderWs';
import { updateOrderStatus } from '../models/orderModel';

// const connection = new IORedis({
//   host: config.redis.host,
//   port: config.redis.port,
//   password: process.env.REDIS_PASSWORD,        // <── add this
//   //password: config.redis.password, 
//   maxRetriesPerRequest: null,
//   tls: process.env.REDIS_TLS === '1' ? {} : undefined
// });
const connection = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    tls: {}
  });
  

export function startOrderWorker() {
  const worker = new Worker(
    'orders',
    async (job) => {
      const { orderId, tokenIn, tokenOut, amount } = job.data;
      try {
        // routing
        sendOrderStatus(orderId, { status: 'routing' });
        await updateOrderStatus(orderId, 'routing');

        const { best, all } = await dexRouter.getBestQuote(tokenIn, tokenOut, amount);
        console.log(
          '[router] order',
          orderId,
          'raydium=',
          all.raydium,
          'meteora=',
          all.meteora,
          'selected=',
          best.dex
        );

        await updateOrderStatus(orderId, 'building', { selectedDex: best.dex });
        sendOrderStatus(orderId, {
          status: 'building',
          data: { selectedDex: best.dex, quotes: all }
        });

        // building tx (simulated)

        sendOrderStatus(orderId, { status: 'submitted' });
        await updateOrderStatus(orderId, 'submitted');

        const exec = await dexRouter.executeSwap(best.dex, {
          tokenIn,
          tokenOut,
          amount,
          quotedPrice: best.price
        });

        await updateOrderStatus(orderId, 'confirmed', {
          executedPrice: exec.executedPrice,
          txHash: exec.txHash
        });
        sendOrderStatus(orderId, {
          status: 'confirmed',
          data: {
            dex: exec.dex,
            txHash: exec.txHash,
            executedPrice: exec.executedPrice
          }
        });
      } catch (err: any) {
        console.error('[orderWorker] order failed', orderId, err?.message || err);
        await updateOrderStatus(orderId, 'failed', {
          failureReason: err?.message || 'unknown error'
        });
        sendOrderStatus(orderId, {
          status: 'failed',
          data: { error: err?.message || 'unknown error' }
        });
        throw err; // let BullMQ handle retries (attempts/backoff below)
      }
    },
    {
      connection,
      concurrency: 10
    }
  );

  // listen for permanently failed jobs
  worker.on('failed', (job, err) => {
    console.log('[orderWorker] job permanently failed', job?.id, err?.message);
  });

  return worker;
}

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },
  removeOnComplete: 1000,
  removeOnFail: 1000
};
