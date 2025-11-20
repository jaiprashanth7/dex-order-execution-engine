import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

jest.setTimeout(15000);

describe('Order queue basic behaviour', () => {
  const connection = new IORedis();
  const queue = new Queue('test-orders', { connection });

  afterAll(async () => {
    await queue.close();
    await connection.quit();
  });

  it('processes jobs with retry and backoff', async () => {
    let attempts = 0;
    const worker = new Worker(
      'test-orders',
      async () => {
        attempts++;
        if (attempts < 2) throw new Error('fail once');
      },
      { connection, concurrency: 1 }
    );

    await queue.add('job', {}, { attempts: 3, backoff: { type: 'exponential', delay: 100 } });
    await worker.waitUntilReady();

    await new Promise<void>((resolve) => {
      worker.on('completed', () => resolve());
    });

    expect(attempts).toBeGreaterThanOrEqual(2);
    await worker.close();
  });
});
