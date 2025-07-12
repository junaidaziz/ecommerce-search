import { getDb } from '@lib/db';

jest.mock('@lib/db', () => ({
  getDb: jest.fn(),
}));
jest.mock('@lib/products', () => ({ mapDbRowToProduct: jest.fn() }));
jest.mock('@lib/notifications', () => ({ createNotification: jest.fn() }));
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }));

const { hasOrdersForProduct } = require('@lib/orders');

const mockGetDb = getDb as jest.Mock;

describe('hasOrdersForProduct', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns false when product has no orders', async () => {
    const db = {
      product: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
      variant: { findMany: jest.fn().mockResolvedValue([]) },
      order: { count: jest.fn() },
    } as any;
    mockGetDb.mockReturnValue(db);
    const result = await hasOrdersForProduct('p1');
    expect(result).toBe(false);
    expect(db.product.findUnique).toHaveBeenCalledWith({
      where: { uuid: 'p1' },
      select: { id: true },
    });
    expect(db.variant.findMany).toHaveBeenCalledWith({ where: { productId: 1 }, select: { id: true } });
    expect(db.order.count).not.toHaveBeenCalled();
  });

  it('returns true when orders exist', async () => {
    const db = {
      product: { findUnique: jest.fn().mockResolvedValue({ id: 2 }) },
      variant: { findMany: jest.fn().mockResolvedValue([{ id: 5 }]) },
      order: { count: jest.fn().mockResolvedValue(3) },
    } as any;
    mockGetDb.mockReturnValue(db);
    const result = await hasOrdersForProduct('p2');
    expect(result).toBe(true);
    expect(db.order.count).toHaveBeenCalledWith({ where: { variantId: { in: [5] } } });
  });

  it('returns false when product not found', async () => {
    const db = {
      product: { findUnique: jest.fn().mockResolvedValue(null) },
      variant: { findMany: jest.fn() },
      order: { count: jest.fn() },
    } as any;
    mockGetDb.mockReturnValue(db);
    const result = await hasOrdersForProduct('bad');
    expect(result).toBe(false);
    expect(db.variant.findMany).not.toHaveBeenCalled();
    expect(db.order.count).not.toHaveBeenCalled();
  });
});
