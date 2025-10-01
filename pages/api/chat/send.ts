import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { sendMessageToClient } from './stream';
import { getOrCreateChatSession, createChatMessage } from '@lib/chat';
import { findUser } from '@lib/users';
import type { ApiMessage } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ id: number; timestamp: Date } | ApiMessage>
) {
  const session = await getServerSession(req, res, authOptions(req, res));
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { content, messageType, fileUrl, fileName } = req.body as {
    content?: string;
    messageType?: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
  };

  if (messageType === 'text' && !content) {
    return res.status(400).json({ message: 'content required for text messages' });
  }

  try {
    const user = await findUser(session.user.email);
    
    // Get or create chat session
    const chatSession = await getOrCreateChatSession(user?.id);
    
    // Save message to database
    const savedMessage = await createChatMessage({
      sessionId: chatSession.id,
      sender: 'user',
      messageType: messageType || 'text',
      content,
      fileUrl,
      fileName,
    });

    // Simulate a support response
    setTimeout(async () => {
      const supportMessage = await createChatMessage({
        sessionId: chatSession.id,
        sender: 'support',
        messageType: 'text',
        content: "Thanks for your message! We'll get back to you shortly.",
      });

      const supportMessageData = {
        type: 'message',
        data: {
          id: supportMessage.id,
          sender: 'support' as const,
          messageType: supportMessage.messageType,
          content: supportMessage.content,
          fileUrl: supportMessage.fileUrl,
          fileName: supportMessage.fileName,
          timestamp: supportMessage.createdAt,
        },
      };
      
      // Send to the user who sent the message
      sendMessageToClient(session.user!.email!, supportMessageData);
    }, 1000);

    return res.status(201).json({
      id: savedMessage.id,
      timestamp: savedMessage.createdAt,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
}
