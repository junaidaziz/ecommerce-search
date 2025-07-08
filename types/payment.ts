import type { Payment as PrismaPayment } from '@prisma/client';
import type { Order } from './order';
import type { PaymentMethod } from './paymentMethod';

// Base Payment type matching Prisma schema
export type Payment = PrismaPayment;

// Payment with relations (for app use)
export type PaymentWithRelations = Payment & {
  order: Order;
  paymentMethod: PaymentMethod;
};

// Payment input for creating payments (matches Prisma fields)
export type PaymentInput = Pick<
  PrismaPayment,
  'orderId' | 'amount' | 'provider' | 'status' | 'paymentMethodId' | 'transactionId'
>;

// Payment update type
export type PaymentUpdate = Partial<Omit<PaymentInput, 'orderId'>>;

// Payment response type
export type PaymentResponse = PaymentWithRelations;

// Payment summary for lists
export type PaymentSummary = Pick<
  PrismaPayment,
  'id' | 'amount' | 'provider' | 'status' | 'transactionId' | 'createdAt'
>;
