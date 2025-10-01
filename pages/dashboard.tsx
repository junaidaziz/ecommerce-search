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
    <>
      <Head>
        <title>{getPageTitle('Dashboard')}</title>
      </Head>
      {/* Hero Section */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Dashboard Overview</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              {user.role === USER_ROLES.SUPER_ADMIN 
                ? 'Monitor platform performance, sales analytics, and system metrics across all brands and users.'
                : 'Track your brand performance, sales analytics, and inventory status in real-time.'
              }
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.role === USER_ROLES.SUPER_ADMIN ? 'Platform Analytics' : 'Brand Analytics'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {user.role === USER_ROLES.SUPER_ADMIN 
                  ? 'Comprehensive overview of all platform activities'
                  : 'Your brand performance metrics and insights'
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Analytics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <TotalProductsCard />
          <TotalSalesCard />
          <OrdersThisMonthCard />
        </div>
        
        {/* Additional Analytics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <BestSellersCard />
          <InventoryAlertsCard />
          {user.brandName && <ExistingProductsCard />}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
