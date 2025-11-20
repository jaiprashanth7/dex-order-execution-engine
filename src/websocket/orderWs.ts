import type { SocketStream } from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import { OrderStatus } from '../types';

type WsClient = SocketStream & { orderId?: string };

const orderClients = new Map<string, Set<WsClient>>();

export function registerOrderSocket(orderId: string, conn: SocketStream, _req: FastifyRequest) {
  const clients = orderClients.get(orderId) || new Set<WsClient>();
  (conn as WsClient).orderId = orderId;
  clients.add(conn as WsClient);
  orderClients.set(orderId, clients);

  conn.socket.on('close', () => {
    const set = orderClients.get(orderId);
    if (set) {
      set.delete(conn as WsClient);
      if (set.size === 0) orderClients.delete(orderId);
    }
  });
}

export interface StatusPayload {
  status: OrderStatus;
  data?: any;
}

export function sendOrderStatus(orderId: string, payload: StatusPayload) {
  const clients = orderClients.get(orderId);
  if (!clients) return;
  const msg = JSON.stringify({ orderId, ...payload });
  for (const c of clients) {
    c.socket.send(msg);
  }
}
