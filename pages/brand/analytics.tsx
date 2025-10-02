import { apiFetch } from '@lib/api';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import ChartContainer from '@components/ChartContainer';
import TopProductsChart from '@components/analytics/TopProductsChart';
import DashboardCard from '@components/dashboard/DashboardCard';
import TotalProductsCard from '@components/dashboard/TotalProductsCard';
import TotalSalesCard from '@components/dashboard/TotalSalesCard';
import { UserRole, USER_ROLES } from '@/types';
import OrdersThisMonthCard from '@components/dashboard/OrdersThisMonthCard';
import InventoryAlertsCard from '@components/dashboard/InventoryAlertsCard';
import CartIcon from '@components/icons/CartIcon';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as ReBarChart,
  Bar,
  Cell,
} from 'recharts';

const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true';

const dummySalesOverTime = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 900 },
  { name: 'Mar', value: 1500 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 1600 },
];

const dummyOrdersByCategory = [
  { name: 'Electronics', value: 120 },
  { name: 'Clothing', value: 90 },
  { name: 'Books', value: 60 },
  { name: 'Furniture', value: 30 },
];

const dummyInventoryStatus = [
  { name: 'In Stock', value: 150 },
  { name: 'Low Stock', value: 40 },
  { name: 'Out of Stock', value: 10 },
];

const BAR_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

type TopProduct = {
  id: string;
  qty: number;
};

type AnalyticsData = {
  totalOrders: number;
  totalRevenue: number;
  topProducts: TopProduct[];
};

type EarningsData = {
  totalEarned: number;
  pending: number;
};

const BrandAnalytics: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);

  const salesData = useDummyData ? dummySalesOverTime : [];
  const ordersData = useDummyData ? dummyOrdersByCategory : [];
  const inventoryData = useDummyData ? dummyInventoryStatus : [];

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        setLoading(true);
        const analyticsRes = await apiFetch('/api/brand/analytics');
        const analyticsData = analyticsRes.ok
          ? await analyticsRes.json()
          : null;
        setData(
          analyticsData || { totalOrders: 0, totalRevenue: 0, topProducts: [] }
        );
        const earningsRes = await apiFetch('/api/brand/earnings');
        setEarnings(earningsRes.ok ? await earningsRes.json() : null);
      } catch {
        setData({ totalOrders: 0, totalRevenue: 0, topProducts: [] });
        setEarnings(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Please log in to view analytics.</p>
        </div>
      </div>
    );
  }
  
  if (user.role !== USER_ROLES.BRAND && user.role !== USER_ROLES.SUPER_ADMIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Brand access required.</p>
        </div>
      </div>
    );
  }

  if (loading || data === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>{getPageTitle('Brand Analytics')}</title>
      </Head>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-blue-100">Track your performance and insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <TotalProductsCard />
        <TotalSalesCard />
        <OrdersThisMonthCard />
        <InventoryAlertsCard />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <DashboardCard title="Sales Over Time">
          <ChartContainer dataLength={salesData.length} height="16rem">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#salesGradient)"
                  strokeWidth={3}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </DashboardCard>
        <DashboardCard title="Orders by Category">
          <ChartContainer dataLength={ordersData.length} height="16rem">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {ordersData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </DashboardCard>
        <DashboardCard title="Inventory Status">
          <ChartContainer dataLength={inventoryData.length} height="16rem">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {inventoryData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </DashboardCard>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Top Products</h2>
        {data.topProducts.length > 0 ? (
          <>
            <ul className="list-disc pl-4 space-y-1 mb-6 text-gray-700 dark:text-gray-300">
              {data.topProducts.map((p) => (
                <li key={p.id}>
                  {p.id} - {p.qty} sold
                </li>
              ))}
            </ul>
            <TopProductsChart data={data.topProducts} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <CartIcon className="w-8 h-8 mb-2" />
            <p>No sales yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandAnalytics;
