import { apiFetch } from '@lib/api';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Order } from '@/types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function AdminOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    setLoading(true);
    apiFetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, status, search]);

  return (
    <div className="max-w-4xl mx-auto">
      <Head>
        <title>{getPageTitle('Orders')}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>
      <div className="flex gap-2 mb-4">
        <select
          className="select select-bordered"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          className="input input-bordered flex-1"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.user.email}</td>
                  <td>{o.product.title}</td>
                  <td>{o.status}</td>
                  <td>£{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p>No orders found.</p>}
        </div>
      )}
    </div>
  );
}
