import type { Variant as PrismaVariant } from '@prisma/client';

// Base Variant type matching Prisma schema
export type Variant = PrismaVariant;

// Variant with parsed attributes (for app use)
export type VariantWithParsedAttributes = Variant & {
  attributes: Record<string, string | number | boolean>;
};

// Input type for creating variants (matches Prisma fields)
export type VariantInput = Pick<
  PrismaVariant,
  'productId' | 'attributes' | 'quantity' | 'priceModifier'
> & {
  uuid?: string;
};

// Update type for variants
export type VariantUpdate = Partial<Omit<VariantInput, 'productId'>>;

// Variant response type
export type VariantResponse = Variant;

// Variant with minimal fields for lists
export type VariantSummary = Pick<
  PrismaVariant,
  'id' | 'uuid' | 'attributes' | 'quantity' | 'priceModifier'
>;
