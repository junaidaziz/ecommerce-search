import { useEffect, useState, useContext } from 'react';
import OrderChatWindow from '@components/Chat/OrderChatWindow';
import { useRouter } from 'next/router';
import type { Order } from '../../types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';
import { AppContext } from '@contexts/AppContext';

export default function OrderDetail() {
  const router = useRouter();
  const app = useContext(AppContext);
  const user = app?.user;
  const { orderId } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const endpoint =
      user?.role === 'user'
        ? `/api/user/orders/${orderId}`
        : `/api/orders/${orderId}`;
    setLoading(true);
    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setOrder(null);
            return Promise.reject(new Error('Not found'));
          }
          const d = await res.json().catch(() => null);
          return Promise.reject(new Error(d?.message || 'Failed to load order'));
        }
        return res.json();
      })
      .then((d) => {
        setOrder(d);
        setError(null);
      })
      .catch((err) => {
        if (err.message !== 'Not found') {
          setError('Failed to load order');
        }
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [orderId, user?.role]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">{error}</p>;
  if (!order) return <p className="p-4">Order not found.</p>;

  return (
    <div className="max-w-xl mx-auto space-y-2">
      <Head>
        <title>{getPageTitle(`Order ${order.id}`)}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
      <p>Status: {order.status}</p>
      <p>Product: {order.product.title}</p>
      <p>Quantity: {order.quantity}</p>
      <p>Total: £{order.total}</p>
      <a
        className="btn btn-primary mt-4"
        href={`/api/orders/${order.uuid}/invoice`}
      >
        Download Invoice
      </a>
      <button
        type="button"
        className="btn btn-secondary mt-4 ml-2"
        onClick={() => setChatOpen(true)}
      >
        Chat with Brand
      </button>
      <OrderChatWindow
        isOpen={chatOpen}
        orderId={order.uuid}
        brandName={order.product.vendor.brandName || 'Brand'}
        brandLogo={order.product.vendor.logo}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
