import type { Product } from './product';
import type { Variant } from './variant';

// Cart item interface
export interface CartItem {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  quantity: number;
  images?: string;
  qty: number;
  variant?: Variant;
  vendor?: {
    id: number;
    brandName?: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

// Cart response interface
export interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Cart update interface
export interface CartUpdate {
  productId: number;
  quantity: number;
  variantId?: string;
}

// Cart item input for adding to cart
export interface CartItemInput {
  productId: number;
  quantity: number;
  variantId?: string;
}
