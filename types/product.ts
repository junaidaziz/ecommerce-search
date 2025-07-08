import type { Product as PrismaProduct } from '@prisma/client';
import type { Category } from './category';
import type { User } from './user';
import type { Variant } from './variant';

// Base Product type matching Prisma schema
export type Product = PrismaProduct;

// Product with relations and computed fields (for app use)
export type ProductWithRelations = Product & {
  vendor: User;
  category: Category;
  variants: Variant[];
  // Computed fields
  soldCount?: number;
  reviewCount?: number;
  averageRating?: number;
  totalInventory?: number;
  descriptionText?: string;
  bodyHtmlText?: string;
  featuredImage?: string;
  imagesArray?: string[]; // Parsed from images string
};

// Input type for creating products (matches Prisma fields)
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
  | 'images'
> & {
  slug?: string;
  uuid?: string;
};

// Update type for products
export type ProductUpdate = Partial<Omit<ProductInput, 'vendorId' | 'categoryId'>>;

// Product response type
export type ProductResponse = ProductWithRelations;

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
