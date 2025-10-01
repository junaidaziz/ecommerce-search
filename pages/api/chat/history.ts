import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getOrCreateChatSession, getChatMessages } from '@lib/chat';
import { findUser } from '@lib/users';
import type { ApiMessage } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ sessionId: number; messages: unknown[] } | ApiMessage>
) {
  const session = await getServerSession(req, res, authOptions(req, res));
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await findUser(session.user.email);
    
    // Get or create chat session
    const chatSession = await getOrCreateChatSession(user?.id);
    
    // Get all messages for the session
    const messages = await getChatMessages(chatSession.id);
    
    return res.status(200).json({
      sessionId: chatSession.id,
      messages: messages.map(m => ({
        id: m.id,
        sender: m.sender,
        messageType: m.messageType,
        content: m.content,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error loading chat history:', error);
    return res.status(500).json({ message: 'Failed to load chat history' });
  }
}
