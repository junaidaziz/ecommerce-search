import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import CouponManager from '@components/Coupons/CouponManager';

const UserCoupons: React.FC = () => (
  <div className="max-w-2xl mx-auto">
    <Head>
      <title>{getPageTitle('Coupons & Offers')}</title>
    </Head>
    <h1 className="text-2xl font-bold mb-4">Coupons & Offers</h1>
    <CouponManager />
  </div>
);

export default UserCoupons;
