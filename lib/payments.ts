import { getDb } from './db';

export function recordPayment(data: {
  orderId: number;
  amount: number;
  provider: string;
  status: string;
  paymentMethodId: number;
  transactionId: string;
}) {
  const db = getDb();
  return db.payment.create({ data });
}
