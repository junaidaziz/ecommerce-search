export interface Notification {
  id: number;
  userId: number;
  orderId: number;
  message: string;
  read: boolean;
  createdAt: Date;
}
