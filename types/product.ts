import type { Product as PrismaProduct } from '@prisma/client';

export interface Product {
  id: string;
  uuid?: string;
  slug: string;
  title: string;
  vendor?: string;
  description?: string;
  productType?: string;
  tags?: string;
  category?: string;
  images?: string[];
  totalInventory?: number;
  priceRange?: {
    minVariantPrice: { amount: number; currencyCode: string };
    maxVariantPrice: { amount: number; currencyCode: string };
  };
  soldCount: number;
  reviewCount: number;
  averageRating: number;
  featuredImage?: { url: string };
  minPrice: number;
  maxPrice: number;
  currency: string;
  descriptionText?: string;
  bodyHtmlText?: string;
  quantity?: number;
  vendorId?: number;
  categoryId?: number;
  vendorBrandName?: string | null;
  categoryName?: string | null;
  imagesUrls?: string[];
  imagesAltText?: string[];
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ProductResponse = Product;

export interface ProductInput {
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string;
  category?: string;
  images?: string[];
  quantity?: number;
  price?: number;
}

export interface ProductDbRow {
  id: number;
  uuid?: string;
  slug: string | null;
  title: string;
  vendorId?: number | undefined;
  vendor?: { brandName: string | null } | null;
  category?: { name: string | null } | null;
};
