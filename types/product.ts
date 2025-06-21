import type { Product as PrismaProduct } from '@prisma/client';
import type { Category } from './category';
import type { Vendor } from './vendor';
import type { Brand } from './brand';
import type { Image } from './image';
import type { PriceRange } from './price';

export interface Product {
  id: string;
  uuid?: string;
  slug: string;
  sku: PrismaProduct['sku'];
  title: string;
  description?: string;
  productType?: string;
  tags?: string;
  quantity?: number;
  priceRange?: PriceRange;
  images?: Image[];
  soldCount: number;
  reviewCount: number;
  averageRating: number;
  featuredImage?: Image;
  minPrice: number;
  maxPrice: number;
  currency: string;
  descriptionText?: string;
  bodyHtmlText?: string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  vendor?: Vendor | string;
  brand?: Brand | string;
  category?: Category | string;
}

export type ProductResponse = Product;

export interface ProductInput {
  sku: PrismaProduct['sku'];
  title: string;
  description?: string;
  vendor?: Vendor;
  productType?: string;
  tags?: string;
  category?: Category;
  images?: Image[];
  quantity?: number;
  price?: number;
}

export interface ProductDbRow {
  id: number;
  uuid?: string;
  slug: string | null;
  sku: PrismaProduct['sku'] | null;
  title: string;
  vendor?: Vendor | null;
  category?: Category | null;
}
