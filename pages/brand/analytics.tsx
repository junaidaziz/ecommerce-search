import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';
import BarChart from '../../components/BarChart';
import ChartContainer from '../../components/ChartContainer';
import DashboardCard from '../../components/dashboard/DashboardCard';
import TotalProductsCard from '../../components/dashboard/TotalProductsCard';
import TotalSalesCard from '../../components/dashboard/TotalSalesCard';
import OrdersThisMonthCard from '../../components/dashboard/OrdersThisMonthCard';
import InventoryAlertsCard from '../../components/dashboard/InventoryAlertsCard';
import CartIcon from '../../components/icons/CartIcon';
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
    setLoading(true);
    fetch(
      `/api/brand/analytics?vendor=${encodeURIComponent(user.brandName || '')}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((d) =>
        setData(d || { totalOrders: 0, totalRevenue: 0, topProducts: [] })
      )
      .finally(() => setLoading(false));
    fetch(
      `/api/brand/earnings?vendor=${encodeURIComponent(user.brandName || '')}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then(setEarnings);
  }, [user]);

  if (!user) return <div className="p-4">Please log in.</div>;
  if (user.role !== 'brand')
    return <div className="p-4">Brand access required.</div>;

  if (loading || data === null) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
      <Head>
        <title>{getPageTitle('Brand Analytics')}</title>
      </Head>
      <h1 className="text-2xl font-bold text-center sm:text-left">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalProductsCard brand={user.brandName || undefined} />
        <TotalSalesCard brand={user.brandName || undefined} />
        <OrdersThisMonthCard brand={user.brandName || undefined} />
        <InventoryAlertsCard brand={user.brandName || undefined} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Sales Over Time">
          <ChartContainer dataLength={salesData.length} height="16rem">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
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
                <Bar dataKey="value" fill="#8884d8" />
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
                <Bar dataKey="value" fill="#8884d8" />
              </ReBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </DashboardCard>
      </div>
      <div className="max-w-2xl mx-auto">
        <DashboardCard title="Top Products">
          {data.topProducts.length > 0 ? (
            <>
              <ul className="list-disc pl-4 space-y-1">
                {data.topProducts.map((p) => (
                  <li key={p.id}>
                    {p.id} - {p.qty} sold
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <BarChart
                  data={data.topProducts.map((p) => ({ label: p.id, value: p.qty }))}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <CartIcon className="w-8 h-8 mb-2" />
              <p>No sales yet.</p>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

export default BrandAnalytics;
