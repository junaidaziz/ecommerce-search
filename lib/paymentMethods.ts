import { getDb } from './db';
import type { Prisma } from '@prisma/client';

const prisma = getDb();

export function listPaymentMethods(userId: number) {
  return prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export function getPaymentMethod(id: number, userId: number) {
  return prisma.paymentMethod.findFirst({ where: { id, userId } });
}

export async function createPaymentMethod(
  userId: number,
  data: Prisma.PaymentMethodCreateInput
) {
  if (data.isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  return prisma.paymentMethod.create({
    data: { ...data, user: { connect: { id: userId } } },
  });
}

export async function setDefaultPaymentMethod(userId: number, id: number) {
  await prisma.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false },
  });
  return prisma.paymentMethod.update({
    where: { id },
    data: { isDefault: true },
  });
}

export function deletePaymentMethod(id: number) {
  return prisma.paymentMethod.delete({ where: { id } });
}
