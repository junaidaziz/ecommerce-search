import loginHandler from '../pages/api/login';
import { findUser } from '../lib/users';
import bcrypt from 'bcryptjs';
import { METHOD_NOT_ALLOWED } from '../constants/messages';

jest.mock('@lib/users', () => ({
  findUser: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('Brand Login API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('requires POST method', async () => {
    const req = { method: 'GET', body: {} } as any;
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: METHOD_NOT_ALLOWED,
    });
  });

  test('requires email and password', async () => {
    const req = { method: 'POST', body: { email: 'test@test.com' } } as any;
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'email and password required',
    });
  });

  test('rejects invalid credentials', async () => {
    (findUser as jest.Mock).mockResolvedValue(null);
    const req = {
      method: 'POST',
      body: { email: 'test@test.com', password: 'wrong' },
    } as any;
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Invalid credentials',
    });
  });

  test('rejects disabled user', async () => {
    (findUser as jest.Mock).mockResolvedValue({
      disabled: true,
      password: 'hashed',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const req = {
      method: 'POST',
      body: { email: 'test@test.com', password: 'password' },
    } as any;
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Invalid credentials',
    });
  });

  test('rejects wrong password', async () => {
    (findUser as jest.Mock).mockResolvedValue({
      disabled: false,
      password: 'hashed',
      role: 'BRAND',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const req = {
      method: 'POST',
      body: { email: 'brand@test.com', password: 'wrong' },
    } as any;
    const res = mockRes();
    await loginHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Invalid credentials',
    });
  });

  test('allows verified brand login', async () => {
    (findUser as jest.Mock).mockResolvedValue({
      disabled: false,
      password: 'hashed',
      firstName: 'Brand',
      lastName: 'User',
      brandName: 'Test Brand',
      gender: 'other',
      role: 'BRAND',
      verified: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const req = {
      method: 'POST',
      body: { email: 'brand@test.com', password: 'password' },
    } as any;
    const res = mockRes();
    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Login successful',
      user: {
        email: 'brand@test.com',
        firstName: 'Brand',
        lastName: 'User',
        brandName: 'Test Brand',
        gender: 'other',
        role: 'BRAND',
        verified: true,
      },
    });
  });

  test('allows unverified brand login in local env', async () => {
    // Local environment - unverified brands should be able to login
    process.env.AUTO_CONFIRM_BRANDS = 'true';
    
    (findUser as jest.Mock).mockResolvedValue({
      disabled: false,
      password: 'hashed',
      firstName: 'Brand',
      lastName: 'User',
      brandName: 'Test Brand',
      gender: 'other',
      role: 'BRAND',
      verified: false,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const req = {
      method: 'POST',
      body: { email: 'brand@test.com', password: 'password' },
    } as any;
    const res = mockRes();
    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Login successful',
      user: {
        email: 'brand@test.com',
        firstName: 'Brand',
        lastName: 'User',
        brandName: 'Test Brand',
        gender: 'other',
        role: 'BRAND',
        verified: false,
      },
    });
    
    delete process.env.AUTO_CONFIRM_BRANDS;
  });

  test('allows regular user login regardless of verification', async () => {
    (findUser as jest.Mock).mockResolvedValue({
      disabled: false,
      password: 'hashed',
      firstName: 'Regular',
      lastName: 'User',
      brandName: '',
      gender: 'male',
      role: 'USER',
      verified: false,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const req = {
      method: 'POST',
      body: { email: 'user@test.com', password: 'password' },
    } as any;
    const res = mockRes();
    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({
      message: 'Login successful',
      user: {
        email: 'user@test.com',
        firstName: 'Regular',
        lastName: 'User',
        brandName: '',
        gender: 'male',
        role: 'USER',
        verified: false,
      },
    });
  });
});