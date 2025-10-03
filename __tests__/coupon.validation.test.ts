import { validateCoupon } from '@lib/validation/couponSchema';

describe('coupon validation', () => {
  const base = {
    code: 'SAVE10',
    discountType: 'percent',
    discountValue: 10,
  } as any;

  it('accepts valid percent coupon', () => {
    const res = validateCoupon(base);
    expect(res.success).toBe(true);
  });

  it('rejects percent > 100', () => {
    const res = validateCoupon({ ...base, discountValue: 150 });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i: any) => i.path[0] === 'discountValue')).toBe(true);
    }
  });

  it('rejects empty code', () => {
    const res = validateCoupon({ ...base, code: '' });
    expect(res.success).toBe(false);
  });

  it('rejects invalid code chars', () => {
    const res = validateCoupon({ ...base, code: 'SAVE-10' });
    expect(res.success).toBe(false);
  });

  it('allows bogo without discountValue', () => {
    const res = validateCoupon({ code: 'BOGO', discountType: 'bogo' });
    expect(res.success).toBe(true);
  });

  it('rejects amount <= 0', () => {
    const res = validateCoupon({ code: 'A1', discountType: 'amount', discountValue: 0 });
    expect(res.success).toBe(false);
  });
});
