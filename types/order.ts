import type { Order as PrismaOrder } from '@prisma/client';
import type { User } from './user';
import type { Product } from './product';

export enum OrderStatus {
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order extends PrismaOrder {
  user: User;
  product: Product;
  status: OrderStatus;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paymentProof?: string | null;
}

type OrderResponse = Order;

export type OrderInput = Pick<
  PrismaOrder,
  'userId' | 'productId' | 'quantity' | 'total' | 'status'
>;

export interface OrderRow extends PrismaOrder {
  user?: User | null;
  product?: Product | null;
  status: OrderStatus;
}
