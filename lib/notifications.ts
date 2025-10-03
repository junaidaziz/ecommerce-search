import { prisma } from './prisma';
import type { Notification, NotificationInput, NotificationType } from '../types';

export async function createNotification(data: NotificationInput): Promise<Notification> {
  return prisma.notification.create({ 
    data: {
      userId: data.userId,
      orderId: data.orderId || null,
      message: data.message,
      type: data.type || 'GENERAL',
      read: data.read || false,
    } as any
  }) as any;
}

export async function getNotificationsForUser(userId: number): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  }) as any;
}

export async function getNotificationsByType(
  userId: number,
  type?: NotificationType
): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: 'desc' },
  }) as any;
}

export async function markNotificationsRead(userId: number): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getNotificationPreferences(userId: number) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    // Create default preferences if they don't exist
    prefs = await prisma.notificationPreference.create({
      data: {
        userId,
        orderUpdates: true,
        promotions: true,
        discounts: true,
        generalUpdates: true,
        emailNotifications: true,
      },
    });
  }

  return prefs;
}

export async function updateNotificationPreferences(
  userId: number,
  data: {
    orderUpdates?: boolean;
    promotions?: boolean;
    discounts?: boolean;
    generalUpdates?: boolean;
    emailNotifications?: boolean;
  }
) {
  const existing = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (existing) {
    return prisma.notificationPreference.update({
      where: { userId },
      data,
    });
  } else {
    return prisma.notificationPreference.create({
      data: {
        userId,
        orderUpdates: data.orderUpdates ?? true,
        promotions: data.promotions ?? true,
        discounts: data.discounts ?? true,
        generalUpdates: data.generalUpdates ?? true,
        emailNotifications: data.emailNotifications ?? true,
      },
    });
  }
}
