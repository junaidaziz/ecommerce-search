import handler from '@pages/api/sessions/list';
import { getServerSession } from 'next-auth/next';
import { getDb } from '@lib/db';

// Mock dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@pages/api/auth/[...nextauth]', () => ({
  authOptions: jest.fn(),
}));

jest.mock('@lib/db', () => ({
  getDb: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
    },
    loginSession: {
      findMany: jest.fn(),
    },
  })),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('/api/sessions/list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-GET requests', async () => {
    const req = { method: 'POST' } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Method not allowed',
    });
  });

  it('should return 401 for unauthenticated users', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = { method: 'GET' } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
    });
  });

  it('should return sessions for authenticated user', async () => {
    const mockSession = {
      user: { email: 'test@example.com' },
    };

    const mockUser = {
      id: 1,
    };

    const mockSessions = [
      {
        id: 1,
        uuid: 'session-uuid-1',
        sessionToken: 'token-1',
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        deviceInfo: 'Chrome on Windows',
        lastActivity: new Date('2024-01-01T12:00:00Z'),
        createdAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        id: 2,
        uuid: 'session-uuid-2',
        sessionToken: 'token-2',
        userAgent: 'Safari/17.0',
        ipAddress: '192.168.1.1',
        deviceInfo: 'Safari on macOS',
        lastActivity: new Date('2024-01-01T11:00:00Z'),
        createdAt: new Date('2024-01-01T09:00:00Z'),
      },
    ];

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    const mockDb = getDb();
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (mockDb.loginSession.findMany as jest.Mock).mockResolvedValue(mockSessions);

    const req = {
      method: 'GET',
      cookies: {
        'next-auth.session-token': 'token-1',
      },
    } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonCall = res.status.mock.results[0].value.json;
    const data = jsonCall.mock.calls[0][0];
    expect(data.sessions).toHaveLength(2);
    expect(data.sessions[0].uuid).toBe('session-uuid-1');
    expect(data.sessions[0].isCurrent).toBe(true);
    expect(data.sessions[1].isCurrent).toBe(false);
  });

  it('should return 404 if user not found', async () => {
    const mockSession = {
      user: { email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    const mockDb = getDb();
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = { method: 'GET' } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });
});
