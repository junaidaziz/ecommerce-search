import type { WishlistItem as PrismaWishlistItem } from '@prisma/client';
import type { Product } from './product';
import type { User } from './user';

// Base WishlistItem type matching Prisma schema
export type WishlistItem = PrismaWishlistItem;

// WishlistItem with relations (for app use)
export type WishlistItemWithRelations = WishlistItem & {
  product: Product;
  user: User;
};

// Wishlist item input for adding to wishlist (matches Prisma fields)
export type WishlistItemInput = Pick<
  PrismaWishlistItem,
  'userId' | 'productId' | 'variantId' | 'notifyOnStock'
> & {
  uuid?: string;
};

// Wishlist response type (app-specific)
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
