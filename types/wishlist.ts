import type { WishlistItem as PrismaWishlistItem } from '@prisma/client';
import type { Product } from './product';

export interface WishlistItem extends PrismaWishlistItem {
  product: Product;
}
