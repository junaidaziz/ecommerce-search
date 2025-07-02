import { getSalesMetrics, ORDER_SUCCESS_STATUSES } from '@lib/analytics';
import { getDb } from '@lib/db';

jest.mock('@lib/db', () => ({
  getDb: jest.fn(),
}));

const mockGetDb = getDb as jest.Mock;

describe('getSalesMetrics', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('builds query with vendor and dates', async () => {
    const count = jest.fn().mockResolvedValue(2);
    const aggregate = jest.fn().mockResolvedValue({ _sum: { total: 50 } });
    mockGetDb.mockReturnValue({ order: { count, aggregate } });
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const result = await getSalesMetrics({ vendorId: 1, start, end });
    expect(count).toHaveBeenCalledWith({
      where: {
        status: { in: ORDER_SUCCESS_STATUSES },
        createdAt: { gte: start, lte: end },
        product: { vendorId: 1 },
      },
    });
    expect(aggregate).toHaveBeenCalledWith({
      where: {
        status: { in: ORDER_SUCCESS_STATUSES },
        createdAt: { gte: start, lte: end },
        product: { vendorId: 1 },
      },
      _sum: { total: true },
    });
    expect(result).toEqual({ count: 2, revenue: 50 });
  });

  it('handles empty totals', async () => {
    const count = jest.fn().mockResolvedValue(0);
    const aggregate = jest.fn().mockResolvedValue({ _sum: { total: null } });
    mockGetDb.mockReturnValue({ order: { count, aggregate } });
    const result = await getSalesMetrics();
    expect(result).toEqual({ count: 0, revenue: 0 });
  });
});
