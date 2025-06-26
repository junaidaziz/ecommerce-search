import { prisma } from './prisma';
import type { Message } from '../types';

export async function createMessage(data: {
  senderId: number;
  receiverId: number;
  orderId: number;
  content: string;
}): Promise<Message> {
  return prisma.message.create({ data });
}

export async function getMessagesForOrder(orderId: number): Promise<Message[]> {
  return prisma.message.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
  });
}
