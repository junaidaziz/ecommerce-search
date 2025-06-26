import handler from '../pages/api/categories/check';
import { getCategoriesFlat } from '../lib/products';

jest.mock('../lib/products', () => ({
  getCategoriesFlat: jest.fn(),
}));

test('reports category exists', async () => {
  (getCategoriesFlat as jest.Mock).mockResolvedValue([
    { id: 1, name: 'Books', slug: 'books', createdAt: new Date(), updatedAt: new Date() },
  ]);
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const req = { method: 'GET', query: { name: 'Books' } } as any;
  const res = { status } as any;
  await handler(req, res);
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ exists: true, category: expect.any(Object) });
});

test('reports category not found', async () => {
  (getCategoriesFlat as jest.Mock).mockResolvedValue([]);
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const req = { method: 'GET', query: { name: 'New' } } as any;
  const res = { status } as any;
  await handler(req, res);
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ exists: false });
});
