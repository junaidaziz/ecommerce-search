import { apiFetch } from '@lib/api';
import { useEffect, useState, useContext } from 'react';
import OrderChatWindow from '@components/Chat/OrderChatWindow';
import { useRouter } from 'next/router';
import { UserRole, type Order, USER_ROLES } from '@/types';
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
      user?.role === USER_ROLES.USER
        ? `/api/user/orders/${orderId}`
        : `/api/orders/${orderId}`;
    setLoading(true);
    apiFetch(endpoint)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setOrder(null);
            setError('Order not found');
            return;
          }
          const d = await res.json().catch(() => null);
          setError(d?.message || 'Failed to load order');
          return;
        }
        const d = await res.json();
        setOrder(d);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load order');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [orderId, user?.role]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!order) return <p className="p-4">Order not found.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <Head>
        <title>{getPageTitle(`Order #${order.id}`)}</title>
      </Head>
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide 
            ${order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'}`}
          >
            {order.status}
          </span>
          <span className="text-gray-500 text-xs">Placed: {new Date(order.createdAt).toLocaleString()}</span>
        </div>
        <div className="mb-4">
          <div className="font-semibold">Product:</div>
          <div className="flex items-center gap-3 mt-1">
            {order.product?.featuredImage &&
              (typeof order.product.featuredImage === 'string' ? (
                <img src={order.product.featuredImage} alt={order.product.title} className="w-16 h-16 rounded object-cover border" />
              ) : (order.product.featuredImage && typeof order.product.featuredImage === 'object' && 'url' in order.product.featuredImage) ? (
                <img src={(order.product.featuredImage as { url: string }).url} alt={order.product.title} className="w-16 h-16 rounded object-cover border" />
              ) : null)
            }
            <div>
              <div className="font-medium">{order.product?.title}</div>
              <div className="text-xs text-gray-500">SKU: {order.product?.sku}</div>
            </div>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-6">
          <div>
            <div className="text-xs text-gray-500">Quantity</div>
            <div className="font-semibold">{order.quantity}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total</div>
            <div className="font-semibold">£{order.total}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500">Shipping Address</div>
          <div className="font-medium">{order.shippingAddress || 'N/A'}</div>
        </div>
        <div className="flex gap-2 mt-6">
          <a
            className="btn btn-outline"
            href={`/api/orders/${order.uuid}/invoice`}
            target="_blank"
            rel="noopener"
          >
            Download Invoice
          </a>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setChatOpen(true)}
          >
            Chat with Brand
          </button>
        </div>
      </div>
      <OrderChatWindow
        isOpen={chatOpen}
        orderId={order.uuid}
        brandName={order.product?.vendor?.brandName || 'Brand'}
        brandLogo={order.product?.vendor?.logo}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
