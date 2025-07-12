import { apiFetch } from '@lib/api';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@/types';
import { UserRole } from '@/types';
import ExistingProductsCard from '@components/dashboard/ExistingProductsCard';
import TotalProductsCard from '@components/dashboard/TotalProductsCard';
import TotalSalesCard from '@components/dashboard/TotalSalesCard';
import OrdersThisMonthCard from '@components/dashboard/OrdersThisMonthCard';
import BestSellersCard from '@components/dashboard/BestSellersCard';
import InventoryAlertsCard from '@components/dashboard/InventoryAlertsCard';
import WeeklySummaryCard from '@components/dashboard/WeeklySummaryCard';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import Link from 'next/link';

import ChartBarIcon from '@components/icons/ChartBarIcon';
import ShoppingBagIcon from '@components/icons/ShoppingBagIcon';
import CurrencyDollarIcon from '@components/icons/CurrencyDollarIcon';
import TruckIcon from '@components/icons/TruckIcon';
import PlusIcon from '@components/icons/PlusIcon';
import EyeIcon from '@components/icons/EyeIcon';
import CogIcon from '@components/icons/CogIcon';

// Inline SVG icons removed in favor of reusable components

const BrandDashboard: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, alertRes] = await Promise.all([
          apiFetch('/api/dashboard/total-products'),
          apiFetch('/api/dashboard/inventory-alerts'),
        ]);
        if (prodRes.ok && alertRes.ok) {
          const prod = await prodRes.json();
          const alert = await alertRes.json();
          setSummary(
            `${prod.count} active products, ${alert.products.length} low inventory`
          );
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Please log in to manage products.</p>
        </div>
      </div>
    );
  }
  
  if (user.role !== 'brand' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <CogIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Brand access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Head>
        <title>{getPageTitle('Brand Dashboard')}</title>
      </Head>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-6 lg:mb-0">
              {user.logo && (
                <div className="relative">
                  <img
                    src={user.logo}
                    alt="Brand Logo"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              )}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Welcome back, {user.brandName || user.firstName}!
                </h1>
                {summary && (
                  <p className="text-blue-100 text-lg">
                    {summary}
                  </p>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/brand/products/new"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Product
              </Link>
              <Link
                href="/brand/products"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                View Products
              </Link>
              <Link
                href="/brand/orders"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <TruckIcon className="w-5 h-5 mr-2" />
                Manage Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <TotalProductsCard />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <TotalSalesCard />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <OrdersThisMonthCard />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <InventoryAlertsCard />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <BestSellersCard />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <ExistingProductsCard />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <WeeklySummaryCard />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Link
              href="/brand/analytics"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">New product added</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Order completed</p>
                <p className="text-sm text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Analytics updated</p>
                <p className="text-sm text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
