import type { Product as PrismaProduct, Category as PrismaCategory, User as PrismaUser } from '@prisma/client';
import type { Category } from './category';
import type { User } from './user';
import type { Variant } from './variant';

// Base Product type extending Prisma Product
export type Product = PrismaProduct & {
  vendor: User;
  category: Category;
  variants?: Variant[];
  // Additional computed fields
  soldCount?: number;
  reviewCount?: number;
  averageRating?: number;
  totalInventory?: number;
  descriptionText?: string;
  bodyHtmlText?: string;
  featuredImage?: string;
  images?: string[];
};

// Input type for creating products
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
  | 'discountType'
  | 'discountValue'
  | 'status'
  | 'vendorId'
  | 'categoryId'
> & {
  slug?: string;
  uuid?: string;
  images?: string[];
};

// Update type for products
export type ProductUpdate = Partial<Omit<ProductInput, 'vendorId' | 'categoryId'>>;

// Product response type
export type ProductResponse = Product;

// Product with minimal fields for lists
export type ProductSummary = Pick<
  PrismaProduct,
  | 'id'
  | 'uuid'
  | 'slug'
  | 'title'
  | 'minPrice'
  | 'maxPrice'
  | 'currency'
  | 'status'
  | 'quantity'
  | 'createdAt'
> & {
  vendor: Pick<User, 'id' | 'brandName'>;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  averageRating?: number;
  reviewCount?: number;
  featuredImage?: string;
};
