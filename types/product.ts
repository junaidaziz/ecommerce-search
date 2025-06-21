import type { Product as PrismaProduct } from '@prisma/client';
import type { Category } from './category';
import type { Vendor } from './vendor';
import type { Brand } from './brand';
import type { Image } from './image';
import type { PriceRange } from './price';

type ProductBase = Pick<
  PrismaProduct,
  | 'id'
  | 'uuid'
  | 'slug'
  | 'sku'
  | 'title'
  | 'description'
  | 'productType'
  | 'tags'
  | 'quantity'
  | 'minPrice'
  | 'maxPrice'
  | 'currency'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
>;

export interface Product extends ProductBase {
  vendor: Vendor;
  category: Category;
  brand?: Brand;
  images?: Image[];
  priceRange?: PriceRange;
  soldCount: number;
  reviewCount: number;
  averageRating: number;
  featuredImage?: Image;
  /** Total inventory quantity available */
  totalInventory?: number;
  descriptionText?: string;
  bodyHtmlText?: string;
}

type ProductResponse = Product;

export type ProductInput = Pick<
  PrismaProduct,
  | 'sku'
  | 'title'
  | 'description'
  | 'productType'
  | 'tags'
  | 'quantity'
  | 'minPrice'
  | 'maxPrice'
  | 'currency'
  | 'status'
> &
  Partial<Pick<PrismaProduct, 'slug' | 'uuid'>> & {
    vendor: Vendor;
    category: Category;
    brand?: Brand;
    images?: Image[];
  };
