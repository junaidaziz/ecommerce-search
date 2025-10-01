import { prisma } from './prisma';
import type { ChatSession, ChatMessage } from '@prisma/client';

export async function getOrCreateChatSession(userId?: number): Promise<ChatSession> {
  // Try to find an active session for the user
  if (userId) {
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingSession) {
      return existingSession;
    }
  }

  // Create a new session
  return prisma.chatSession.create({
    data: {
      userId,
      status: 'active',
    },
  });
}

export async function createChatMessage(data: {
  sessionId: number;
  sender: 'user' | 'support';
  messageType?: 'text' | 'image' | 'file';
  content?: string;
  fileUrl?: string;
  fileName?: string;
}): Promise<ChatMessage> {
  return prisma.chatMessage.create({
    data: {
      sessionId: data.sessionId,
      sender: data.sender,
      messageType: data.messageType || 'text',
      content: data.content,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
    },
  });
}

export async function getChatMessages(sessionId: number): Promise<ChatMessage[]> {
  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function markMessagesAsSeen(sessionId: number): Promise<void> {
  await prisma.chatMessage.updateMany({
    where: {
      sessionId,
      seen: false,
    },
    data: {
      seen: true,
    },
  });
}

export async function closeChatSession(sessionId: number): Promise<ChatSession> {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: { status: 'closed' },
  });
}

export async function getChatSession(sessionId: number): Promise<ChatSession | null> {
  return prisma.chatSession.findUnique({
    where: { id: sessionId },
  });
}
