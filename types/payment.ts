import type {
  Payment as PrismaPayment,
  PaymentMethod as PrismaPaymentMethod,
} from '@prisma/client';

export interface PaymentMethod extends PrismaPaymentMethod {}

export interface Payment extends PrismaPayment {
  paymentMethod: PaymentMethod;
}
