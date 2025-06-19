import handler from '../pages/api/categories';
import { getCategoryTree } from '../lib/products';

jest.mock('../lib/products', () => ({
  getCategoryTree: jest.fn(),
}));

test('returns categories with subcategories', async () => {
  const data = [{ name: 'Electronics', subcategories: ['Phones'] }];
  getCategoryTree.mockResolvedValue(data);
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const req = { method: 'GET' };
  const res = { status };
  await handler(req, res);
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith(data);
});
