import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { User } from '../../types/user';
import ExistingProductsCard from '../../components/dashboard/ExistingProductsCard';
import TotalProductsCard from '../../components/dashboard/TotalProductsCard';
import TotalSalesCard from '../../components/dashboard/TotalSalesCard';
import OrdersThisMonthCard from '../../components/dashboard/OrdersThisMonthCard';
import BestSellersCard from '../../components/dashboard/BestSellersCard';
import InventoryAlertsCard from '../../components/dashboard/InventoryAlertsCard';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';

const BrandDashboard: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };

  if (!user) {
    return <div className="p-4">Please log in to manage products.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
      <Head>
        <title>{getPageTitle('Brand Dashboard')}</title>
      </Head>
      <h1 className="text-2xl font-bold text-center sm:text-left">
        Brand Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TotalProductsCard brand={user.brandName || undefined} />
        <TotalSalesCard brand={user.brandName || undefined} />
        <OrdersThisMonthCard brand={user.brandName || undefined} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BestSellersCard brand={user.brandName || undefined} />
        <InventoryAlertsCard brand={user.brandName || undefined} />
        <ExistingProductsCard />
      </div>
    </div>
  );
};

export default BrandDashboard;
