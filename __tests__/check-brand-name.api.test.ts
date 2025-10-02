import handler from '@pages/api/check-brand-name';
import { findVendorByName } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';

jest.mock('@lib/users', () => ({
  findVendorByName: jest.fn(),
}));

jest.mock('@utils/handleApiError', () => ({
  handleApiError: jest.fn(),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('check-brand-name API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('requires brandName query param', async () => {
    const req = { method: 'GET', query: {} } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ 
      message: 'Brand name is required' 
    });
  });

  test('reports existing brand name', async () => {
    (findVendorByName as jest.Mock).mockResolvedValue({ 
      id: 1, 
      brandName: 'Test Brand' 
    });
    const req = { method: 'GET', query: { brandName: 'Test Brand' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(findVendorByName).toHaveBeenCalledWith('Test Brand');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ exists: true });
  });

  test('reports missing brand name', async () => {
    (findVendorByName as jest.Mock).mockResolvedValue(null);
    const req = { method: 'GET', query: { brandName: 'New Brand' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ exists: false });
  });

  test('handles errors', async () => {
    (findVendorByName as jest.Mock).mockRejectedValue(new Error('Database error'));
    const req = { method: 'GET', query: { brandName: 'Error Brand' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(handleApiError).toHaveBeenCalled();
  });
});
