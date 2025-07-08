import type { Message as PrismaMessage } from '@prisma/client';
import type { User } from './user';
import type { Order } from './order';

// Base Message type matching Prisma schema
export type Message = PrismaMessage;

// Message with relations (for app use)
export type MessageWithRelations = Message & {
  sender: User;
  receiver: User;
  order: Order;
};

// Message input for creating messages (matches Prisma fields)
export type MessageInput = Pick<
  PrismaMessage,
  'senderId' | 'receiverId' | 'orderId' | 'messageType' | 'content' | 'fileUrl' | 'fileName'
>;

// Message update type
export type MessageUpdate = Partial<Pick<Message, 'seen'>>;

// Message response type
export type MessageResponse = MessageWithRelations;

// Message summary for lists
export type MessageSummary = Pick<
  PrismaMessage,
  'id' | 'messageType' | 'content' | 'fileUrl' | 'fileName' | 'createdAt' | 'seen'
>;

// Message thread interface (app-specific, not Prisma)
export interface MessageThread {
  orderId: number;
  messages: Message[];
  participants: {
    sender: { id: number; name: string };
    receiver: { id: number; name: string };
  };
}
