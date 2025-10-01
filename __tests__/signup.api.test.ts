import brandHandler from '@pages/api/signup/brand';
import userHandler from '@pages/api/signup/user';
import { addUser, findUser } from '@lib/users';
import bcrypt from 'bcryptjs';
import {
  METHOD_NOT_ALLOWED,
  MISSING_REQUIRED_FIELDS,
  USER_EXISTS,
} from '@/constants/messages';

jest.mock('@lib/users', () => ({
  addUser: jest.fn(),
  findUser: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('Brand Signup API', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  test('requires POST method', async () => {
    const req = { method: 'GET', body: {} } as any;
    const res = mockRes();
    await brandHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: METHOD_NOT_ALLOWED,
    });
  });

  test('requires all fields', async () => {
    const req = { method: 'POST', body: { email: 'test@test.com' } } as any;
    const res = mockRes();
    await brandHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: MISSING_REQUIRED_FIELDS,
    });
  });

  test('rejects duplicate email', async () => {
    (findUser as jest.Mock).mockResolvedValue({ id: 1 });
    const req = {
      method: 'POST',
      body: { email: 'test@test.com', password: 'pass', firstName: 'Test' },
    } as any;
    const res = mockRes();
    await brandHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: USER_EXISTS,
    });
  });

  test('creates brand with token in production', async () => {
    process.env.NODE_ENV = 'production';
    (findUser as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (addUser as jest.Mock).mockResolvedValue(undefined);

    const req = {
      method: 'POST',
      body: { email: 'brand@test.com', password: 'pass', firstName: 'Brand' },
    } as any;
    const res = mockRes();
    await brandHandler(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
    expect(addUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'brand@test.com',
        password: 'hashed',
        firstName: 'Brand',
        role: 'BRAND',
        verified: false,
        verificationToken: expect.any(String),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    const jsonCall = res.status.mock.results[0].value.json;
    expect(jsonCall).toHaveBeenCalledWith({ token: expect.any(String) });
    const tokenValue = jsonCall.mock.calls[0][0].token;
    expect(tokenValue).toBeTruthy();
    expect(tokenValue.length).toBeGreaterThan(0);
  });

  test('creates brand without token in local/dev', async () => {
    process.env.NODE_ENV = 'development';
    (findUser as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (addUser as jest.Mock).mockResolvedValue(undefined);

    const req = {
      method: 'POST',
      body: { email: 'brand@test.com', password: 'pass', firstName: 'Brand' },
    } as any;
    const res = mockRes();
    await brandHandler(req, res);

    expect(addUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'brand@test.com',
        role: 'BRAND',
        verified: true,
        verificationToken: null,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      token: '',
    });
  });
});

describe('User Signup API', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  test('creates user with token in production', async () => {
    process.env.NODE_ENV = 'production';
    (findUser as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (addUser as jest.Mock).mockResolvedValue(undefined);

    const req = {
      method: 'POST',
      body: { email: 'user@test.com', password: 'pass', firstName: 'User' },
    } as any;
    const res = mockRes();
    await userHandler(req, res);

    expect(addUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@test.com',
        role: 'USER',
        verified: false,
        verificationToken: expect.any(String),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('creates user without token in local/dev', async () => {
    process.env.NODE_ENV = 'development';
    (findUser as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (addUser as jest.Mock).mockResolvedValue(undefined);

    const req = {
      method: 'POST',
      body: { email: 'user@test.com', password: 'pass', firstName: 'User' },
    } as any;
    const res = mockRes();
    await userHandler(req, res);

    expect(addUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@test.com',
        role: 'USER',
        verified: true,
        verificationToken: null,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
