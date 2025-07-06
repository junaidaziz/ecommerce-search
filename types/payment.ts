// Payment interface matching Prisma schema
export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  provider: string;
  status: string;
  paymentMethodId: number;
  transactionId: string;
  createdAt: Date;
}

// Payment input for creating payments
export type PaymentInput = Pick<
  Payment,
  'orderId' | 'amount' | 'provider' | 'status' | 'paymentMethodId' | 'transactionId'
>;

// Payment update interface
export type PaymentUpdate = Partial<Omit<PaymentInput, 'orderId'>>;

// Payment response interface
export type PaymentResponse = Payment;

// Payment summary for lists
export type PaymentSummary = Pick<
  Payment,
  'id' | 'amount' | 'provider' | 'status' | 'transactionId' | 'createdAt'
>;
