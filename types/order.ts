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

// Base Order type matching Prisma schema
export type Order = PrismaOrder;

// Order with relations (for app use)
export type OrderWithRelations = Order & {
  user: User;
  product: Product;
};

// Input type for creating orders (matches Prisma fields)
export type OrderInput = Pick<
  PrismaOrder,
  'userId' | 'productId' | 'quantity' | 'total' | 'status' | 'paymentMethod' | 'paymentReference' | 'paymentProof'
> & {
  uuid?: string;
};

// Update type for orders
export type OrderUpdate = Partial<Omit<OrderInput, 'userId' | 'productId'>>;

// Order response type
export type OrderResponse = OrderWithRelations;

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
