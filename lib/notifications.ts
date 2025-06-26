import { prisma } from './prisma';
import type { Notification } from '../types';

export async function createNotification(data: {
  userId: number;
  orderId: number;
  message: string;
}): Promise<Notification> {
  return prisma.notification.create({ data });
}

export async function getNotificationsForUser(userId: number): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markNotificationsRead(userId: number): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
