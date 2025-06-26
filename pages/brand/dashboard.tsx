import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../../contexts/AppContext';
import type { User } from '../../types/user';
import type { Product } from '../../types/product';
import Link from 'next/link';
import TotalProductsCard from '../../components/dashboard/TotalProductsCard';
import TotalSalesCard from '../../components/dashboard/TotalSalesCard';
import OrdersThisMonthCard from '../../components/dashboard/OrdersThisMonthCard';
import BestSellersCard from '../../components/dashboard/BestSellersCard';
import InventoryAlertsCard from '../../components/dashboard/InventoryAlertsCard';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';

type ProductApi = Product;

const BrandDashboard: React.FC = () => {
  const { user } = useContext(AppContext) as { user: User | null };
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [lowStock, setLowStock] = useState<ProductApi[]>([]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const res = await fetch(
      `/api/brand/products?vendor=${encodeURIComponent(user.brandName || '')}`
    );
    if (res.ok) {
      setProducts(await res.json());
    }
    const lowRes = await fetch(
      `/api/brand/low-stock?vendor=${encodeURIComponent(user.brandName || '')}`
    );
    if (lowRes.ok) {
      setLowStock(await lowRes.json());
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


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
        <BestSellersCard brand={user.brandName || undefined} />
        <InventoryAlertsCard brand={user.brandName || undefined} />
      </div>
      <div className="max-w-4xl mx-auto border border-gray-200 rounded-lg shadow-sm p-6 bg-base-100 space-y-4">
        {lowStock.length > 0 && (
          <div className="alert alert-warning">
            Low stock on {lowStock.length} product
            {lowStock.length > 1 ? 's' : ''}.
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Existing Products</h2>
          <Link href="/brand/products" className="btn btn-primary">
            Go to Products
          </Link>
        </div>
        <p>You currently have {products.length} product{products.length !== 1 ? 's' : ''}.</p>
      </div>
    </div>
  );
};

export default BrandDashboard;
