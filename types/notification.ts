import type { Notification as PrismaNotification } from '@prisma/client';
import type { User } from './user';
import type { Order } from './order';

// Notification type enum
export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PROMOTION = 'PROMOTION',
  DISCOUNT = 'DISCOUNT',
  GENERAL = 'GENERAL',
}

// Base Notification type matching Prisma schema
export type Notification = PrismaNotification & {
  type?: NotificationType;
};

// Notification with relations (for app use)
export type NotificationWithRelations = Notification & {
  user: User;
  order?: Order | null;
};

// Notification input for creating notifications (matches Prisma fields)
export type NotificationInput = {
  userId: number;
  orderId?: number | null;
  message: string;
  type?: NotificationType;
  read?: boolean;
};

// Notification update type
export type NotificationUpdate = Partial<Pick<Notification, 'message' | 'read'>>;

// Notification response type
export type NotificationResponse = NotificationWithRelations;

// Notification summary for lists
export type NotificationSummary = Pick<
  Notification,
  'id' | 'message' | 'read' | 'createdAt' | 'type'
>;

// Notification count interface
export interface NotificationCount {
  total: number;
  unread: number;
}

// Notification preferences type
export interface NotificationPreference {
  id: number;
  userId: number;
  orderUpdates: boolean;
  promotions: boolean;
  discounts: boolean;
  generalUpdates: boolean;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notification preference input
export type NotificationPreferenceInput = Omit<
  NotificationPreference,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

// Notification preference update
export type NotificationPreferenceUpdate = Partial<NotificationPreferenceInput>;
