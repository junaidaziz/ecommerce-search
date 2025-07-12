import handler from '@pages/api/tags';
import { getDistinctTags } from '@lib/products';
import { handleApiError } from '@utils/handleApiError';

jest.mock('@lib/products', () => ({
  getDistinctTags: jest.fn(),
}));

jest.mock('@utils/handleApiError', () => ({
  handleApiError: jest.fn(),
}));

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as any;
}

describe('tags API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns tags list', async () => {
    (getDistinctTags as jest.Mock).mockResolvedValue(['a', 'b']);
    const req = { method: 'GET', query: { search: 'a' } } as any;
    const res = mockRes();
    await handler(req, res);
    expect(getDistinctTags).toHaveBeenCalledWith('a');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status.mock.results[0].value.json).toHaveBeenCalledWith({ tags: ['a', 'b'] });
  });

  test('rejects non-GET', async () => {
    const req = { method: 'POST' } as any;
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  test('handles errors', async () => {
    (getDistinctTags as jest.Mock).mockRejectedValue(new Error('fail'));
    const req = { method: 'GET', query: {} } as any;
    const res = mockRes();
    await handler(req, res);
    expect(handleApiError).toHaveBeenCalled();
  });
});
