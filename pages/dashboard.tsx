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
  
  // In production, block unverified brands from accessing dashboard
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && user.role === USER_ROLES.BRAND && !user.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verification Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please verify your email address to access the dashboard. Check your inbox for a verification link.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{getPageTitle('Dashboard')}</title>
      </Head>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-800">
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
