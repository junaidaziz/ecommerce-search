import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getDb } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

const prisma = getDb();

export interface LoginSessionInfo {
  id: number;
  uuid: string;
  userAgent: string | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  lastActivity: Date;
  createdAt: Date;
  isCurrent: boolean;
}

export interface SessionsResponse {
  sessions: LoginSessionInfo[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionsResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }

    const session = await getServerSession(req, res, authOptions(req, res));
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current session token from cookie or header
    const currentSessionToken = req.cookies['next-auth.session-token'] 
      || req.cookies['__Secure-next-auth.session-token'];

    // Get all active sessions for the user
    const sessions = await prisma.loginSession.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        uuid: true,
        sessionToken: true,
        userAgent: true,
        ipAddress: true,
        deviceInfo: true,
        lastActivity: true,
        createdAt: true,
      },
      orderBy: { lastActivity: 'desc' },
    });

    // Map sessions and mark current session
    const sessionsInfo: LoginSessionInfo[] = sessions.map(s => ({
      id: s.id,
      uuid: s.uuid,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      deviceInfo: s.deviceInfo,
      lastActivity: s.lastActivity,
      createdAt: s.createdAt,
      isCurrent: s.sessionToken === currentSessionToken,
    }));

    return res.status(200).json({ sessions: sessionsInfo });
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch sessions');
  }
}
