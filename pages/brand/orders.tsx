import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Order } from '../../types';
import Head from 'next/head';
import { getPageTitle } from '../../lib/pageTitle';


const BrandOrders: React.FC = () => {
  const { user } = useContext(AppContext)!;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(
      `/api/brand/orders?vendor=${encodeURIComponent(user.brandName || '')}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Order[]) => {
        setOrders(data);
        setError(null);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="p-4">Please log in to view orders.</div>;
  }
  if (user.role !== 'brand') {
    return <div className="p-4">Brand access required.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Head>
        <title>{getPageTitle('Brand Orders')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner"></span>
        </div>
      )}
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border p-2">
            <p>
              Order #{o.id} - {o.status}
            </p>
            <p>Total: £{o.total}</p>
          </li>
        ))}
        {!loading && orders.length === 0 && <li>No orders found.</li>}
      </ul>
    </div>
  );
};

export default BrandOrders;
