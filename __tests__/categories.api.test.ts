jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../pages/api/auth/[...nextauth]', () => ({ authOptions: {} }));

import handler from '../pages/api/categories';
import { getCategoryTree } from '../lib/products';

jest.mock('../lib/products', () => ({
  getCategoryTree: jest.fn(),
}));

test('returns categories list', async () => {
  const data = [
    {
      id: 1,
      uuid: 'u1',
      name: 'Electronics',
      slug: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  (getCategoryTree as jest.Mock).mockResolvedValue(data);
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const req = { method: 'GET' } as any;
  const res = { status } as any;
  await handler(req, res);
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ categories: data });
});
