import handler from '@pages/api/check-email';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import { EMAIL_REQUIRED } from '@/constants/messages';

jest.mock('@lib/users', () => ({
  findUser: jest.fn(),
}));

jest.mock('@utils/handleApiError', () => ({
  handleApiError: jest.fn(),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('check-email API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('requires email query param', async () => {
    const req = { method: 'GET', query: {} } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ message: EMAIL_REQUIRED });
  });

  test('reports existing email', async () => {
    (findUser as jest.Mock).mockResolvedValue({ id: 1 });
    const req = { method: 'GET', query: { email: 'test@example.com' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(findUser).toHaveBeenCalledWith('test@example.com');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ exists: true });
  });

  test('reports missing email', async () => {
    (findUser as jest.Mock).mockResolvedValue(null);
    const req = { method: 'GET', query: { email: 'none@example.com' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ exists: false });
  });

  test('handles errors', async () => {
    (findUser as jest.Mock).mockRejectedValue(new Error('fail'));
    const req = { method: 'GET', query: { email: 'x@test.com' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(handleApiError).toHaveBeenCalled();
  });
});
