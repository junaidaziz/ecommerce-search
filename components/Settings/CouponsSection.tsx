import CouponManager from '../Coupons/CouponManager';
import { TagIcon } from '@heroicons/react/24/outline';

const CouponsSection: React.FC = () => (
  <div className="w-full max-w-3xl mx-auto">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
          <TagIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons & Offers</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your available coupons and discounts</p>
        </div>
      </div>
      <CouponManager />
    </div>
  </div>
);

export default CouponsSection;
