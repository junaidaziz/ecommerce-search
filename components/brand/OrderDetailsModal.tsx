import React from 'react';
import Image from 'next/image';
import { GenericModal, StatusLabel } from '@components/UI';
import type { Order } from '@/types';

interface OrderGroup {
  order: Order;
  items: Order[];
}

interface Props {
  group: OrderGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<Props> = ({ group, isOpen, onClose }) => {
  if (!group) return null;
  const { order, items } = group;

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
              order.status === 'processing'
                ? 'warning'
                : order.status === 'shipped'
                ? 'info'
                : order.status === 'delivered'
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
        <div className="flex justify-end">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </GenericModal>
  );
};

export default OrderDetailsModal;
