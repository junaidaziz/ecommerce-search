import { getDb } from './db';
import type { NextApiRequest } from 'next';

const prisma = getDb();

/**
 * Parse user agent to extract device information
 */
function parseUserAgent(userAgent: string): string {
  if (!userAgent) return 'Unknown Device';
  
  // Detect operating system
  let os = 'Unknown OS';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) browser = 'Chrome';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Edg/')) browser = 'Edge';
  
  return `${browser} on ${os}`;
}

/**
 * Get IP address from request
 */
function getIpAddress(req: NextApiRequest): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.socket.remoteAddress || null;
}

/**
 * Create or update a login session
 */
export async function trackLoginSession(
  userId: number,
  sessionToken: string,
  req: NextApiRequest
): Promise<void> {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = getIpAddress(req);
  const deviceInfo = parseUserAgent(userAgent);
  
  // Session expires in 30 days (default NextAuth JWT expiration)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Try to find existing session with this token
  const existing = await prisma.loginSession.findUnique({
    where: { sessionToken },
  });

  if (existing) {
    // Update last activity
    await prisma.loginSession.update({
      where: { sessionToken },
      data: { lastActivity: new Date() },
    });
  } else {
    // Create new session
    await prisma.loginSession.create({
      data: {
        userId,
        sessionToken,
        userAgent,
        ipAddress,
        deviceInfo,
        expiresAt,
      },
    });
  }
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  try {
    await prisma.loginSession.updateMany({
      where: { sessionToken },
      data: { lastActivity: new Date() },
    });
  } catch (error) {
    // Silently fail - session tracking is not critical
    console.error('Failed to update session activity:', error);
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.loginSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}

/**
 * Revoke all sessions for a user except the current one
 */
export async function revokeOtherSessions(
  userId: number,
  currentSessionToken: string
): Promise<number> {
  const result = await prisma.loginSession.deleteMany({
    where: {
      userId,
      sessionToken: { not: currentSessionToken },
    },
  });
  return result.count;
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(userId: number) {
  return prisma.loginSession.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActivity: 'desc' },
  });
}
