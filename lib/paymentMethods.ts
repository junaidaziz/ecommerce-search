import { getDb } from './db';

export async function addPaymentMethod(
  userId: number,
  data: {
    provider: string;
    cardLast4: string;
    cardBrand: string;
    expMonth: number;
    expYear: number;
    token: string;
    isDefault?: boolean;
  }
) {
  const db = getDb();
  if (data.isDefault) {
    await db.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  return db.paymentMethod.create({
    data: { ...data, userId, isDefault: data.isDefault || false },
  });
}

export function getPaymentMethodsForUser(userId: number) {
  const db = getDb();
  return db.paymentMethod.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function setDefaultPaymentMethod(userId: number, id: number) {
  const db = getDb();
  await db.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false },
  });
  await db.paymentMethod.update({ where: { id }, data: { isDefault: true } });
}

export function deletePaymentMethod(id: number) {
  const db = getDb();
  return db.paymentMethod.delete({ where: { id } });
}
