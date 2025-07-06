import CouponManager from '../Coupons/CouponManager';
import { TagIcon } from '@heroicons/react/24/outline';

const CouponsSection: React.FC = () => (
  <div className="max-w-2xl mx-auto mt-4">
    <div className="bg-base-100 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-full">
          <TagIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Coupons & Offers</h2>
          <p className="text-sm text-gray-600">Manage your available coupons and discounts</p>
        </div>
      </div>
      <CouponManager />
    </div>
  </div>
);

export default CouponsSection;
