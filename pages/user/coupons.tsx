import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import type { Coupon } from '@/types';

const UserCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  useEffect(() => {
    fetch('/api/user/coupons')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('Coupons & Offers')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Coupons & Offers</h1>
      <ul className="space-y-2">
        {coupons.map((c) => (
          <li key={c.code} className="border p-2">
            <p className="font-semibold">{c.code}</p>
            <p>
              {c.discountType === 'percent' ? `${c.amount}% off` : `£${c.amount} off`}
            </p>
          </li>
        ))}
        {coupons.length === 0 && <li>No coupons available.</li>}
      </ul>
    </div>
  );
};

export default UserCoupons;
