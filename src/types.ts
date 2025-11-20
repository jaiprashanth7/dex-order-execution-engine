export type OrderType = 'MARKET';

export type OrderStatus =
  | 'pending'
  | 'routing'
  | 'building'
  | 'submitted'
  | 'confirmed'
  | 'failed';

export interface CreateOrderDto {
  tokenIn: string;
  tokenOut: string;
  amount: number;
  // later: side, user wallet, etc
}

export interface Order {
  id: string;
  type: OrderType;
  tokenIn: string;
  tokenOut: string;
  amount: number;
  status: OrderStatus;
  selectedDex?: 'raydium' | 'meteora';
  executedPrice?: number;
  txHash?: string;
  failureReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
