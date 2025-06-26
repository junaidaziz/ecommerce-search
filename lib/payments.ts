import { getDb } from './db';
import type { Prisma } from '@prisma/client';

const prisma = getDb();

export function recordPayment(data: Prisma.PaymentCreateInput) {
  return prisma.payment.create({ data });
}
