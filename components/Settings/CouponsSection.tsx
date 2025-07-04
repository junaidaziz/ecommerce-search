import CouponManager from '../Coupons/CouponManager';

const CouponsSection: React.FC = () => (
  <div className="max-w-2xl mx-auto">
    <h2 className="text-xl font-bold mb-2">Coupons &amp; Offers</h2>
    <CouponManager />
  </div>
);

export default CouponsSection;
