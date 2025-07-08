import type { Notification as PrismaNotification } from '@prisma/client';
import type { User } from './user';
import type { Order } from './order';

// Base Notification type matching Prisma schema
export type Notification = PrismaNotification;

// Notification with relations (for app use)
export type NotificationWithRelations = Notification & {
  user: User;
  order: Order;
};

// Notification input for creating notifications (matches Prisma fields)
export type NotificationInput = Pick<
  PrismaNotification,
  'userId' | 'orderId' | 'message' | 'read'
>;

// Notification update type
export type NotificationUpdate = Partial<Pick<Notification, 'message' | 'read'>>;

// Notification response type
export type NotificationResponse = NotificationWithRelations;

// Notification summary for lists
export type NotificationSummary = Pick<
  PrismaNotification,
  'id' | 'message' | 'read' | 'createdAt'
>;

// Notification count interface
export interface NotificationCount {
  total: number;
  unread: number;
}
