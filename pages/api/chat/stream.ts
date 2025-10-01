import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';

// Store active SSE connections
const clients = new Map<string, NextApiResponse>();

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions(req, res));
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const clientId = session.user.email;
  
  // Store client connection
  clients.set(clientId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeatInterval);
      clients.delete(clientId);
      return;
    }
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    clients.delete(clientId);
  });
}

// Helper function to broadcast message to a specific client
export function sendMessageToClient(clientId: string, message: unknown) {
  const client = clients.get(clientId);
  if (client && !client.writableEnded) {
    client.write(`data: ${JSON.stringify(message)}\n\n`);
  }
}

// Helper function to broadcast to all clients
export function broadcastMessage(message: unknown) {
  clients.forEach((client, clientId) => {
    if (!client.writableEnded) {
      client.write(`data: ${JSON.stringify(message)}\n\n`);
    } else {
      clients.delete(clientId);
    }
  });
}

// Export clients map for use in other API routes
export { clients };
