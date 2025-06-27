import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Order } from '../../types';
import Head from 'next/head';
import { getPageTitle } from '@lib/pageTitle';

export default function OrderDetail() {
  const router = useRouter();
  const { uuid } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;
    fetch(`/api/orders/${uuid}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => {
        setOrder(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [uuid]);

  if (loading) return <p className="p-4">Loading...</p>;
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
    </div>
  );
}
