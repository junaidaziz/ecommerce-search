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

export async function markNotificationRead(notificationId: number, userId: number): Promise<Notification | null> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  
  if (!notification) return null;
  
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function deleteNotification(notificationId: number, userId: number): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  
  if (!notification) return false;
  
  await prisma.notification.delete({
    where: { id: notificationId },
  });
  
  return true;
}

