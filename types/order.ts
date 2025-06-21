import type { User } from './user';
import type { Product, ProductDbRow } from './product';
import type { Coupon } from './coupon';

export interface ShippingInfo {
  name: string;
  address: string;
}

export interface Order {
  id: number;
  uuid: string;
  userId: number;
  productId: number;
  quantity: number;
  total: number;
  status: 'pending' | 'shipped' | 'completed';
  user: User;
  product: Product;
  coupon?: Coupon;
  shipping?: ShippingInfo;
  createdAt: string;
  updatedAt: string;
}

export type OrderResponse = Order;

export interface OrderInput {
  userId: number;
  productId: number;
  quantity: number;
  total: number;
  couponId?: number;
  shipping?: ShippingInfo;
}

export interface OrderProductRow extends ProductDbRow {
  description: string;
  productType: string;
  tags: string[] | string;
  images: string[];
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
}

export interface OrderRow {
  id: number;
  uuid: string;
  userId: number;
  productId: number;
  quantity: number;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  product: OrderProductRow;
  coupon?: Coupon | null;
}
