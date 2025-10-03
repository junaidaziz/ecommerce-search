import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import CouponManager from '@components/Coupons/CouponManager';

const UserCoupons: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-6">
    <Head>
      <title>{getPageTitle('Coupons & Offers')}</title>
    </Head>
    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Coupons & Offers</h1>
    <CouponManager />
  </div>
);

export default UserCoupons;
