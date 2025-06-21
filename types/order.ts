import { Product } from './product';

export interface OrderItem extends Product {
  qty: number;
}

export interface Order {
  id: number;
  uuid?: string;
  userId: number;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod?: string;
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderResponse = Order;

export interface OrderInput {
  userId: number;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  shippingAddress?: string;
}

export interface OrderRow {
  id: number;
  uuid?: string;
  userId: number;
  user: {
    id: number;
    email: string;
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
  updatedAt: Date;
}
