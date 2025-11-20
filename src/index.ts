import { buildServer } from './server';
import { config } from './config';
import { startOrderWorker } from './queue/orderWorker';

async function main() {
  const app = await buildServer();   // <--- this is the function we just exported
  startOrderWorker();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${config.port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
