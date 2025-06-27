import type { Product } from './product';
import type { Variant } from './variant';

export interface CartItem extends Product {
  qty: number;
  variant?: Variant;
}

export interface CartResponse {
  items: CartItem[];
}
