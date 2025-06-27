import handler from '../pages/api/coupons/[code]';
import { findCouponByCode } from '../lib/coupons';

jest.mock('../lib/coupons', () => ({
  findCouponByCode: jest.fn(),
}));

test('returns coupon data', async () => {
  (findCouponByCode as jest.Mock).mockResolvedValue({
    id: 1,
    code: 'SAVE',
    discountType: 'percent',
    amount: 10,
    minOrderValue: 50,
    isActive: true,
    usedCount: 0,
  });
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const req = { method: 'GET', query: { code: 'SAVE' } } as any;
  const res = { status } as any;
  await handler(req, res);
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({
    id: 1,
    code: 'SAVE',
    discountType: 'percent',
    amount: 10,
    minOrderValue: 50,
    isActive: true,
    usedCount: 0,
  });
});

test('invalid code', async () => {
  (findCouponByCode as jest.Mock).mockResolvedValue(null);
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const req = { method: 'GET', query: { code: 'BAD' } } as any;
  const res = { status } as any;
  await handler(req, res);
  expect(status).toHaveBeenCalledWith(404);
});
