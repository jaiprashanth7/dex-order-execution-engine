import { FastifyInstance } from 'fastify';
import { createMarketOrder } from '../services/orderService';
import { registerOrderSocket } from '../websocket/orderWs';

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.post('/api/orders/execute', async (req, reply) => {
    const body: any = req.body;

    if (!body?.tokenIn || !body?.tokenOut || typeof body?.amount !== 'number') {
      return reply.code(400).send({ error: 'tokenIn, tokenOut, amount are required' });
    }

    const order = await createMarketOrder({
      tokenIn: body.tokenIn,
      tokenOut: body.tokenOut,
      amount: body.amount
    });

    return reply.send({ orderId: order.id, status: order.status });
  });

  fastify.get(
    '/api/orders/execute',
    { websocket: true },
    (connection, req) => {
      const orderId = (req.query as any).orderId as string | undefined;
      if (!orderId) {
        connection.socket.send(JSON.stringify({ error: 'orderId query param required' }));
        connection.socket.close();
        return;
      }
      registerOrderSocket(orderId, connection, req);

      connection.socket.send(JSON.stringify({ orderId, status: 'pending' }));
    }
  );
}
