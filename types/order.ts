import type { Order as PrismaOrder } from '@prisma/client';
import type { User } from './user';
import type { Product } from './product';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

// Base Order type extending Prisma Order
export type Order = PrismaOrder & {
  user: User;
  product: Product;
  status: OrderStatus;
};

// Input type for creating orders
export type OrderInput = Pick<
  PrismaOrder,
  'userId' | 'productId' | 'quantity' | 'total' | 'status'
> & {
  paymentMethod?: string;
  paymentReference?: string;
  paymentProof?: string;
};

// Update type for orders
export type OrderUpdate = Partial<Omit<OrderInput, 'userId' | 'productId'>>;

// Order response type
export type OrderResponse = Order;

// Order with minimal fields for lists
export type OrderSummary = Pick<
  PrismaOrder,
  | 'id'
  | 'uuid'
  | 'quantity'
  | 'total'
  | 'status'
  | 'createdAt'
> & {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  product: Pick<Product, 'id' | 'title' | 'slug'>;
};
