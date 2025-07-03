import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import dayjs from 'dayjs';
import OrderChatWindow from '@components/Chat/OrderChatWindow';
import { StatusLabel } from '@components/UI';
import { getPageTitle } from '@lib/pageTitle';
import type { Order } from '../../../types';
import { OrderStatus } from '../../../types';

export default function UserOrderDetail() {
  const router = useRouter();
  const { uuid } = router.query;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    fetch(`/api/user/orders/${uuid}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          return Promise.reject(d?.message || 'Failed to load order');
        }
        return res.json();
      })
      .then((d: Order) => {
        setOrder(d);
        setError(null);
      })
      .catch((e) => {
        setError(typeof e === 'string' ? e : 'Failed to load order');
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  const cancelOrder = async () => {
    if (!order) return;
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    const res = await fetch(`/api/user/orders/${order.uuid}/cancel`, {
      method: 'POST',
    });
    if (res.ok) {
      setOrder({ ...order, status: OrderStatus.CANCELLED });
    } else {
      const d = await res.json().catch(() => null);
      alert(d?.message || 'Failed to cancel');
    }
    setCancelling(false);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">{error}</p>;
  if (!order) return <p className="p-4">Order not found.</p>;

  const shippingAddress = order.user
    ? [
        order.user.address,
        order.user.city,
        order.user.state,
        order.user.postalCode,
        order.user.country,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  const paymentStatus =
    order.paymentReference || order.paymentMethod === 'card'
      ? 'Paid'
      : 'Pending';

  const unitPrice = parseFloat(
    typeof order.product.minPrice === 'number'
      ? order.product.minPrice.toString()
      : order.product.minPrice || '0'
  );
  const lineTotal = unitPrice * order.quantity;

  const canCancel = ![
    'shipped',
    'delivered',
    'completed',
    'cancelled',
  ].includes(order.status);

  const formatCurrency = (n: number) => `£${n.toFixed(2)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Head>
        <title>{getPageTitle(`Order ${order.id}`)}</title>
      </Head>
      <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>

      <div className="card bg-base-100 shadow border">
        <div className="card-body space-y-1 text-sm">
          <h2 className="card-title">Order Info</h2>
          <p>
            <span className="font-medium">Order ID:</span> {order.uuid}
          </p>
          <p>
            <span className="font-medium">Placed On:</span>{' '}
            {dayjs(order.createdAt).format('DD MMM YYYY HH:mm')}
          </p>
          <p className="flex items-center gap-1">
            <span className="font-medium">Order Status:</span>
            <StatusLabel
              color={
                order.status === 'pending'
                  ? 'info'
                  : order.status === 'confirmed'
                    ? 'info'
                    : order.status === 'processing'
                      ? 'warning'
                      : order.status === 'shipped'
                        ? 'info'
                        : order.status === 'delivered' ||
                            order.status === 'completed'
                          ? 'success'
                          : 'error'
              }
              className="ml-1"
            >
              {order.status}
            </StatusLabel>
          </p>
          <p>
            <span className="font-medium">Payment Status:</span> {paymentStatus}
          </p>
          <p>
            <span className="font-medium">Payment Method:</span>{' '}
            {order.paymentMethod || '-'}
          </p>
          <p>
            <span className="font-medium">Delivery Method:</span> Standard
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow border">
        <div className="card-body text-sm space-y-1">
          <h2 className="card-title">Shipping Address</h2>
          <p>{shippingAddress || '-'}</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow border">
        <div className="card-body text-sm space-y-1">
          <h2 className="card-title">Billing Address</h2>
          <p>{shippingAddress || '-'}</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow border">
        <div className="card-body text-sm space-y-2">
          <h2 className="card-title">Brand</h2>
          <div className="flex items-center gap-2">
            {order.product.vendor.logo && (
              <Image
                src={order.product.vendor.logo}
                alt={order.product.vendor.brandName || 'Brand'}
                width={32}
                height={32}
                className="rounded"
              />
            )}
            <span>{order.product.vendor.brandName || 'Brand'}</span>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow border">
        <div className="card-body text-sm p-0">
          <h2 className="card-title px-4 pt-4">Products</h2>
          <ul className="divide-y divide-base-200">
            <li className="flex items-center gap-2 p-4">
              <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded">
                <Image
                  src={
                    order.product.featuredImage?.url ||
                    `https://picsum.photos/seed/${order.product.id}/80/80`
                  }
                  alt={order.product.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <span className="flex-1">{order.product.title}</span>
              <span className="whitespace-nowrap">x {order.quantity}</span>
              <span className="whitespace-nowrap">
                {formatCurrency(unitPrice)}
              </span>
              <span className="whitespace-nowrap">
                {formatCurrency(lineTotal)}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="card bg-base-100 shadow border">
        <div className="card-body text-sm space-y-1">
          <h2 className="card-title">Summary</h2>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(lineTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <a className="btn" href={`/api/orders/${order.uuid}/invoice`}>
          Download Invoice
        </a>
        {canCancel && (
          <button
            type="button"
            className="btn btn-error"
            disabled={cancelling}
            onClick={cancelOrder}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setChatOpen(true)}
        >
          Message Brand
        </button>
      </div>

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
