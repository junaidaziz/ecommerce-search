import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmation } from './email';

export interface GuestOrder {
  id: string;
  name: string;
  email: string;
  address: string;
  items: any[];
  total: number;
  status: string;
}

const store = new Map<string, GuestOrder>();

export async function addGuestOrder(data: Omit<GuestOrder, 'id' | 'status'>) {
  const order: GuestOrder = { ...data, id: uuidv4(), status: 'pending' };
  store.set(order.id, order);
  await sendOrderConfirmation(order.email, { id: order.id });
  return order;
}

export function getGuestOrder(id: string) {
  return store.get(id);
}
