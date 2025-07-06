import React, { useContext } from 'react';
import Head from 'next/head';
import { AppContext } from '@contexts/AppContext';
import { getPageTitle } from '@lib/pageTitle';
import { USER_ROLES } from '@/types';
import TotalProductsCard from '@components/dashboard/TotalProductsCard';
import TotalSalesCard from '@components/dashboard/TotalSalesCard';
import OrdersThisMonthCard from '@components/dashboard/OrdersThisMonthCard';
import BestSellersCard from '@components/dashboard/BestSellersCard';
import InventoryAlertsCard from '@components/dashboard/InventoryAlertsCard';
import ExistingProductsCard from '@components/dashboard/ExistingProductsCard';

const DashboardPage: React.FC = () => {
  const { user } = useContext(AppContext) as { user: any };
  if (!user)
    return <div className="p-4">Please log in to view the dashboard.</div>;
  if (user.role !== USER_ROLES.BRAND && user.role !== USER_ROLES.SUPER_ADMIN) {
    return <div className="p-4">Access denied.</div>;
  }
  return (
    <div className="space-y-4">
      <Head>
        <title>{getPageTitle('Dashboard')}</title>
      </Head>
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TotalProductsCard />
        <TotalSalesCard />
        <OrdersThisMonthCard />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BestSellersCard />
        <InventoryAlertsCard />
        {user.brandName && <ExistingProductsCard />}
      </div>
    </div>
  );
};

export default DashboardPage;
