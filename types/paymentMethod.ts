import type { PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import type { User } from './user';
import type { Payment } from './payment';

// Base PaymentMethod type matching Prisma schema
export type PaymentMethod = PrismaPaymentMethod;

// PaymentMethod with relations (for app use)
export type PaymentMethodWithRelations = PaymentMethod & {
  user: User;
  payments: Payment[];
};

// Payment method input for creating payment methods (matches Prisma fields)
export type PaymentMethodInput = Pick<
  PrismaPaymentMethod,
  'userId' | 'provider' | 'cardLast4' | 'cardBrand' | 'expMonth' | 'expYear' | 'token' | 'isDefault'
>;

// Payment method update type
export type PaymentMethodUpdate = Partial<Omit<PaymentMethodInput, 'userId'>>;

// Payment method response type
export type PaymentMethodResponse = PaymentMethodWithRelations;

// Payment method summary for lists
export type PaymentMethodSummary = Pick<
  PrismaPaymentMethod,
  'id' | 'provider' | 'cardLast4' | 'cardBrand' | 'expMonth' | 'expYear' | 'isDefault'
>;
