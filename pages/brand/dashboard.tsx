import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@contexts/AppContext';
import type { User } from '@/types';
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

const BrandDashboard: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [summary, setSummary] = useState('');

  useEffect(() => {
    async function load() {
      const [prodRes, alertRes] = await Promise.all([
        fetch('/api/dashboard/total-products'),
        fetch('/api/dashboard/inventory-alerts'),
      ]);
      if (prodRes.ok && alertRes.ok) {
        const prod = await prodRes.json();
        const alert = await alertRes.json();
        setSummary(
          `${prod.count} active products, ${alert.products.length} low inventory`
        );
      }
    }
    load();
  }, []);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {user.logo && (
            <img
              src={user.logo}
              alt="logo"
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user.brandName || user.firstName}!
            </h1>
            {summary && <p className="text-sm text-gray-600">{summary}</p>}
          </div>
        </div>
        {/* Action buttons moved to BrandHeader */}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalProductsCard />
        <TotalSalesCard />
        <OrdersThisMonthCard />
        <InventoryAlertsCard />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BestSellersCard />
        <ExistingProductsCard />
        <WeeklySummaryCard />
      </div>
    </div>
  );
};

export default BrandDashboard;
