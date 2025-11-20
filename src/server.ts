import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { orderRoutes } from './routes/order.route';

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(websocketPlugin);
  await fastify.register(orderRoutes);

  return fastify;
}
