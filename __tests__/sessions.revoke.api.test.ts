import handler from '@pages/api/sessions/revoke';
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
      deleteMany: jest.fn(),
    },
  })),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('/api/sessions/revoke', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const req = { method: 'GET' } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Method not allowed',
    });
  });

  it('should return 401 for unauthenticated users', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = {
      method: 'POST',
      body: { sessionId: 'session-uuid' },
    } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
    });
  });

  it('should return 400 if sessionId is missing', async () => {
    const mockSession = {
      user: { email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const req = {
      method: 'POST',
      body: {},
    } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'sessionId required',
    });
  });

  it('should successfully revoke a session', async () => {
    const mockSession = {
      user: { email: 'test@example.com' },
    };

    const mockUser = {
      id: 1,
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    const mockDb = getDb();
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (mockDb.loginSession.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

    const req = {
      method: 'POST',
      body: { sessionId: 'session-uuid-to-revoke' },
    } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Session revoked successfully',
    });
    expect(mockDb.loginSession.deleteMany).toHaveBeenCalledWith({
      where: {
        uuid: 'session-uuid-to-revoke',
        userId: 1,
      },
    });
  });

  it('should return 404 if session not found', async () => {
    const mockSession = {
      user: { email: 'test@example.com' },
    };

    const mockUser = {
      id: 1,
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    const mockDb = getDb();
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (mockDb.loginSession.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

    const req = {
      method: 'POST',
      body: { sessionId: 'non-existent-session' },
    } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Session not found',
    });
  });

  it('should return 404 if user not found', async () => {
    const mockSession = {
      user: { email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    const mockDb = getDb();
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = {
      method: 'POST',
      body: { sessionId: 'session-uuid' },
    } as any;
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });
});
