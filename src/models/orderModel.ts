import { query } from '../db';
import type { Order, OrderStatus } from '../types';

export async function insertOrder(order: Order): Promise<void> {
  await query(
    `INSERT INTO orders
     (id, type, token_in, token_out, amount, status, selected_dex, executed_price, tx_hash, failure_reason)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      order.id,
      order.type,
      order.tokenIn,
      order.tokenOut,
      order.amount,
      order.status,
      order.selectedDex || null,
      order.executedPrice || null,
      order.txHash || null,
      order.failureReason || null
    ]
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra: Partial<Order> = {}
): Promise<void> {
  const fields: string[] = ['status = $2', 'updated_at = now()'];
  const values: any[] = [id, status];
  let idx = 3;

  if (extra.selectedDex) {
    fields.push(`selected_dex = $${idx++}`);
    values.push(extra.selectedDex);
  }
  if (extra.executedPrice !== undefined) {
    fields.push(`executed_price = $${idx++}`);
    values.push(extra.executedPrice);
  }
  if (extra.txHash !== undefined) {
    fields.push(`tx_hash = $${idx++}`);
    values.push(extra.txHash);
  }
  if (extra.failureReason !== undefined) {
    fields.push(`failure_reason = $${idx++}`);
    values.push(extra.failureReason);
  }

  const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = $1`;
  await query(sql, values);
}
