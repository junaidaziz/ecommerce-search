import type { Product } from './product';

// Wishlist item interface matching Prisma schema
export interface WishlistItem {
  id: number;
  uuid: string;
  userId: number;
  productId: number;
  variantId?: string | null;
  notifyOnStock: boolean;
  createdAt: Date;
  product: Product;
}

// Wishlist item input for adding to wishlist
export type WishlistItemInput = Pick<
  WishlistItem,
  'userId' | 'productId' | 'variantId' | 'notifyOnStock'
> & {
  uuid?: string;
};

// Wishlist response interface
export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

// Wishlist item summary for lists
export type WishlistItemSummary = Pick<
  WishlistItem,
  'id' | 'uuid' | 'productId' | 'variantId' | 'notifyOnStock' | 'createdAt'
> & {
  product: Pick<Product, 'id' | 'title' | 'slug' | 'minPrice' | 'maxPrice' | 'currency' | 'images'>;
};
