import type { Product } from './product';

export interface CartItem extends Product {
  qty: number;
}

export interface CartResponse {
  items: CartItem[];
}
