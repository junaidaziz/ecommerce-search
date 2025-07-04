import { apiFetch } from '../api';
import type { Order } from '@/types';

export async function fetchUserOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/api/user/orders');
}

export async function reorderOrder(uuid: string): Promise<void> {
  await apiFetch(`/api/user/orders/${uuid}/reorder`, { method: 'POST' });
}

export async function updateUserProfile(data: Record<string, unknown>): Promise<boolean> {
  await apiFetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return true;
}
