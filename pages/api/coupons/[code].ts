const coupons = {
  SAVE10: { percent: 10 },
  SAVE20: { percent: 20 },
};

export default function handler(req, res) {
  const { code } = req.query;
  const coupon = coupons[code?.toUpperCase()];
  if (!coupon) return res.status(404).json({ message: 'Invalid code' });
  res.status(200).json(coupon);
}
