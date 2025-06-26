import React, { useContext } from 'react';
import Head from 'next/head';
import { AppContext } from '../contexts/AppContext';
import { getPageTitle } from '../lib/pageTitle';
import TotalProductsCard from '../components/dashboard/TotalProductsCard';
import TotalSalesCard from '../components/dashboard/TotalSalesCard';
import OrdersThisMonthCard from '../components/dashboard/OrdersThisMonthCard';
import BestSellersCard from '../components/dashboard/BestSellersCard';
import InventoryAlertsCard from '../components/dashboard/InventoryAlertsCard';
import ExistingProductsCard from '../components/dashboard/ExistingProductsCard';

const DashboardPage: React.FC = () => {
  const { user } = useContext(AppContext) as { user: any };
  if (!user)
    return <div className="p-4">Please log in to view the dashboard.</div>;
  const role = (user.role || '').toLowerCase();
  if (role !== 'brand' && role !== 'super_admin') {
    return <div className="p-4">Access denied.</div>;
  }
  const brand = user.brandName || undefined;

  return (
    <div className="space-y-4">
      <Head>
        <title>{getPageTitle('Dashboard')}</title>
      </Head>
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TotalProductsCard brand={brand} />
        <TotalSalesCard brand={brand} />
        <OrdersThisMonthCard brand={brand} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BestSellersCard brand={brand} />
        <InventoryAlertsCard brand={brand} />
        {brand && <ExistingProductsCard />}
      </div>
    </div>
  );
};

export default DashboardPage;
