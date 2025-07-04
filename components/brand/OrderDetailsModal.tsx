import { apiFetch } from '@lib/api';
import React, { useState, useContext } from 'react';
import Image from 'next/image';
import { GenericModal, StatusLabel } from '@components/UI';
import type { Order } from '@/types';
import { NotificationContext } from '@contexts/NotificationContext';

interface OrderGroup {
  order: Order;
  items: Order[];
}

interface Props {
  group: OrderGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const OrderDetailsModal: React.FC<Props> = ({
  group,
  isOpen,
  onClose,
  onUpdated,
}) => {
  // Provide fallback values to satisfy hooks' rules
  const order = group?.order as Order;
  const items = group?.items ?? [];

  const [status, setStatus] = useState(order?.status ?? 'pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useContext(NotificationContext);

  if (!group) return null;

  const updateStatus = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/orders/${order.uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      addNotification('Order updated', 'success');
      if (onUpdated) onUpdated();
    } catch (e) {
      setError('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const customer = order.user
    ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() ||
      order.user.email
    : '-';

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.id}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
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
          >
            {order.status}
          </StatusLabel>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-sm">Customer: {customer}</p>
        <p className="text-sm font-semibold">Total: £{order.total}</p>
        <ul className="divide-y divide-base-200">
          {items.map((item) => (
            <li key={item.uuid} className="flex gap-2 py-2 items-center">
              <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded">
                <Image
                  src={
                    item.product.featuredImage?.url ||
                    `https://picsum.photos/seed/${item.product.id}/80/80`
                  }
                  alt={item.product.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <span className="flex-1">{item.product.title}</span>
              <span className="whitespace-nowrap">x {item.quantity}</span>
            </li>
          ))}
        </ul>
        {error && <div className="alert alert-error">{error}</div>}
        <div>
          <label className="label" htmlFor="status-select">
            <span className="label-text">Status</span>
          </label>
          <select
            id="status-select"
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            {[
              'pending',
              'confirmed',
              'processing',
              'shipped',
              'delivered',
              'completed',
              'cancelled',
              'returned',
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <a
            href={`/api/orders/${order.uuid}/invoice`}
            className="btn btn-outline mr-auto"
          >
            Invoice
          </a>
          <button
            type="button"
            className="btn btn-primary mr-2"
            disabled={saving}
            onClick={updateStatus}
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </GenericModal>
  );
};

export default OrderDetailsModal;
