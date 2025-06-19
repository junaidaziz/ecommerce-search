import { Product } from './product';

export interface OrderItem extends Product {
  qty: number;
}

export interface Order {
  id?: number;
  email: string;
  items: OrderItem[];
  total: number;
  shippingName: string;
  shippingAddress: string;
  createdAt?: string;
}
