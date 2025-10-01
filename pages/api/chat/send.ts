import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { sendMessageToClient } from './stream';
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

  // Create message
  const message = {
    id: Date.now(),
    sender: 'user' as const,
    messageType: messageType || 'text',
    content,
    fileUrl,
    fileName,
    timestamp: new Date(),
  };

  // Broadcast to support staff (in real app, this would be targeted)
  // For now, we'll simulate a support response
  setTimeout(() => {
    const supportMessage = {
      type: 'message',
      data: {
        id: Date.now() + 1,
        sender: 'support' as const,
        messageType: 'text',
        content: "Thanks for your message! We'll get back to you shortly.",
        timestamp: new Date(),
      },
    };
    
    // Send to the user who sent the message
    sendMessageToClient(session.user!.email!, supportMessage);
  }, 1000);

  return res.status(201).json({
    id: message.id,
    timestamp: message.timestamp,
  });
}
