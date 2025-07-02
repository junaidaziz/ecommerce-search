import { prisma } from './prisma';
import type { Message } from '../types';

export async function createMessage(data: {
  senderId: number;
  receiverId: number;
  orderId: number;
  messageType?: 'text' | 'image' | 'file';
  content?: string;
  fileUrl?: string;
  fileName?: string;
}): Promise<Message> {
  return prisma.message.create({
    data: {
      messageType: data.messageType || 'text',
      content: data.content,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      senderId: data.senderId,
      receiverId: data.receiverId,
      orderId: data.orderId,
    },
  });
}

export async function getMessagesForOrder(orderId: number): Promise<Message[]> {
  return prisma.message.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
  });
}
