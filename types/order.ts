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
  status: string;
  shippingAddress: string;
  createdAt?: string;
}

export type OrderResponse = Order;

export interface OrderInput {
  email: string;
  items: OrderItem[];
  total: number;
  shippingName: string;
  shippingAddress: string;
}

export interface OrderRow {
  id: number;
  userId: number;
  user: {
    id: number;
    email: string;
    // add other user properties if needed
  };
  product: {
    id: number;
    slug: string;
    title: string;
    vendorId: number;
    vendor?: { brandName?: string | null };
    description: string;
    productType: string;
    tags: string[];
    category?: { name: string };
    images: string[];
    quantity: number;
    minPrice: number;
    maxPrice: number;
    currency: string;
  };
  quantity: number;
  total: number;
  status: string;
  createdAt: Date;
}
