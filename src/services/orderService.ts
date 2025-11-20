import { v4 as uuidv4 } from 'uuid';
import type { CreateOrderDto, Order } from '../types';
import { insertOrder } from '../models/orderModel';
import { orderQueue } from '../queue/orderQueue';
import { defaultJobOptions } from '../queue/orderWorker';

export async function createMarketOrder(payload: CreateOrderDto): Promise<Order> {
  const id = uuidv4();

  const order: Order = {
    id,
    type: 'MARKET',
    tokenIn: payload.tokenIn,
    tokenOut: payload.tokenOut,
    amount: payload.amount,
    status: 'pending'
  };

  // persist initial order
  await insertOrder(order);

  // enqueue execution job with retries + backoff
  await orderQueue.add(
    'execute',
    {
      orderId: id,
      tokenIn: order.tokenIn,
      tokenOut: order.tokenOut,
      amount: order.amount
    },
    defaultJobOptions
  );

  return order;
}
