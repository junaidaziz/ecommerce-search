// Notification interface matching Prisma schema
export interface Notification {
  id: number;
  userId: number;
  orderId: number;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Notification input for creating notifications
export type NotificationInput = Pick<
  Notification,
  'userId' | 'orderId' | 'message'
> & {
  read?: boolean;
};

// Notification update interface
export type NotificationUpdate = Partial<Pick<Notification, 'message' | 'read'>>;

// Notification response interface
export type NotificationResponse = Notification;

// Notification summary for lists
export type NotificationSummary = Pick<
  Notification,
  'id' | 'message' | 'read' | 'createdAt'
>;

// Notification count interface
export interface NotificationCount {
  total: number;
  unread: number;
}
