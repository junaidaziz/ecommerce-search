import type { User } from './user';
import type { Product } from './product';
import type { Coupon } from './coupon';
import type { ShippingInfo } from './shipping';

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
  createdAt: Date;
  updatedAt: Date;
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
  user?: User | null;
  product?: Product | null;
  coupon?: Coupon | null;
  shipping?: ShippingInfo | null;
}
