import handler from '@pages/api/verify-email';
import { verifyUser } from '@lib/users';
import {
  TOKEN_REQUIRED,
  INVALID_TOKEN,
  EMAIL_VERIFIED,
} from '@/constants/messages';

jest.mock('@lib/users', () => ({
  verifyUser: jest.fn(),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('Verify Email API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('requires token parameter', async () => {
    const req = { query: {} } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: TOKEN_REQUIRED,
    });
  });

  test('returns error for invalid token', async () => {
    (verifyUser as jest.Mock).mockResolvedValue({ count: 0 });
    const req = { query: { token: 'invalid' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(verifyUser).toHaveBeenCalledWith('invalid');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: INVALID_TOKEN,
    });
  });

  test('verifies valid token', async () => {
    (verifyUser as jest.Mock).mockResolvedValue({ count: 1 });
    const req = { query: { token: 'validtoken' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(verifyUser).toHaveBeenCalledWith('validtoken');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: EMAIL_VERIFIED,
    });
  });

  test('handles array token (uses first value)', async () => {
    (verifyUser as jest.Mock).mockResolvedValue({ count: 1 });
    const req = { query: { token: ['token1', 'token2'] } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(verifyUser).toHaveBeenCalledWith('token1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
