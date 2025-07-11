import type { Category as PrismaCategory } from '@prisma/client';

// Base Category type extending Prisma Category
export type Category = PrismaCategory;

// Input type for creating categories
export type CategoryInput = Pick<PrismaCategory, 'name'> & {
  slug?: string;
  uuid?: string;
};

// Update type for categories
export type CategoryUpdate = Partial<Pick<PrismaCategory, 'name' | 'slug'>>;

// Category response type
export type CategoryResponse = Category;

// Category with minimal fields for lists
export type CategorySummary = Pick<
  PrismaCategory,
  'id' | 'uuid' | 'name' | 'slug' | 'createdAt'
>;
