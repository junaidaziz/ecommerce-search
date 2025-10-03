import handler from '@pages/api/user/preferences';
import { findUser, getUserPreferences, updateUserPreferences } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { getServerSession } from 'next-auth/next';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from '@/constants/messages';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@lib/users', () => ({
  findUser: jest.fn(),
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
}));

jest.mock('@utils/handleApiError', () => ({
  handleApiError: jest.fn(),
}));

jest.mock('@pages/api/auth/[...nextauth]', () => ({
  authOptions: jest.fn(),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('user/preferences API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('requires authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = { method: 'GET' } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: UNAUTHORIZED });
  });

  test('returns 404 if user not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue(null);
    const req = { method: 'GET' } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: USER_NOT_FOUND });
  });

  test('GET returns user preferences', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    (getUserPreferences as jest.Mock).mockResolvedValue({
      language: 'en',
      currency: 'USD',
      receiveOrderUpdates: true,
      receivePromotions: false,
    });
    const req = { method: 'GET' } as any;
    const res = mockRes();
    await handler(req, res);
    expect(getUserPreferences).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      language: 'en',
      currency: 'USD',
      receiveOrderUpdates: true,
      receivePromotions: false,
    });
  });

  test('PUT updates user preferences', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    (updateUserPreferences as jest.Mock).mockResolvedValue({});
    (getUserPreferences as jest.Mock).mockResolvedValue({
      language: 'es',
      currency: 'EUR',
      receiveOrderUpdates: true,
      receivePromotions: true,
    });

    const req = {
      method: 'PUT',
      body: {
        language: 'es',
        currency: 'EUR',
        receiveOrderUpdates: true,
        receivePromotions: true,
      },
    } as any;
    const res = mockRes();
    await handler(req, res);
    expect(updateUserPreferences).toHaveBeenCalledWith(1, {
      language: 'es',
      currency: 'EUR',
      receiveOrderUpdates: true,
      receivePromotions: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('PUT validates invalid language', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    const req = {
      method: 'PUT',
      body: { language: 123 },
    } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: 'Invalid language' });
  });

  test('PUT validates invalid currency', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    const req = {
      method: 'PUT',
      body: { currency: 123 },
    } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: 'Invalid currency' });
  });

  test('PUT validates invalid receiveOrderUpdates', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    const req = {
      method: 'PUT',
      body: { receiveOrderUpdates: 'yes' },
    } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: 'Invalid receiveOrderUpdates value' });
  });

  test('PUT validates invalid receivePromotions', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    const req = {
      method: 'PUT',
      body: { receivePromotions: 'no' },
    } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: 'Invalid receivePromotions value' });
  });

  test('rejects unsupported methods', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    const req = { method: 'DELETE' } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: METHOD_NOT_ALLOWED });
  });

  test('handles errors', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    (findUser as jest.Mock).mockRejectedValue(new Error('Database error'));
    const req = { method: 'GET' } as any;
    const res = mockRes();
    await handler(req, res);
    expect(handleApiError).toHaveBeenCalledWith(res, expect.any(Error), 'Failed to manage preferences');
  });
});
