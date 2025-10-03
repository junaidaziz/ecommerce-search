import { getDb } from './db';

export async function addPaymentMethod(
  userId: number,
  data: {
    provider: string;
    cardLast4?: string;
    cardBrand?: string;
    expMonth?: number;
    expYear?: number;
    paypalEmail?: string;
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
    data: { 
      userId, 
      provider: data.provider,
      cardLast4: data.cardLast4 || null,
      cardBrand: data.cardBrand || null,
      expMonth: data.expMonth || null,
      expYear: data.expYear || null,
      paypalEmail: data.paypalEmail || null,
      token: data.token,
      isDefault: data.isDefault || false 
    },
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
