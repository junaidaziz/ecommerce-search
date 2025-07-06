// Base Variant type matching Prisma schema
export interface Variant {
  id: number;
  uuid: string;
  productId: number;
  attributes: Record<string, any>;
  quantity: number;
  priceModifier?: number | null;
}

// Input type for creating variants
export type VariantInput = Pick<
  Variant,
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
  Variant,
  'id' | 'uuid' | 'attributes' | 'quantity' | 'priceModifier'
>;
