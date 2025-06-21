export interface Product {
  ID: string;
  SLUG: string;
  TITLE: string;
  VENDOR?: string;
  DESCRIPTION?: string;
  PRODUCT_TYPE?: string;
  TAGS?: string;
  CATEGORY?: string;
  IMAGES?: string[] | undefined;
  TOTAL_INVENTORY?: number;
  PRICE_RANGE_V2?: {
    min_variant_price: { amount: number; currency_code: string };
    max_variant_price: { amount: number; currency_code: string };
  };
  SOLD_COUNT: number;
  REVIEW_COUNT: number;
  AVERAGE_RATING: number;
  FEATURED_IMAGE?: { url: string };
  MIN_PRICE: number;
  MAX_PRICE: number;
  CURRENCY: string;
  DESCRIPTION_TEXT?: string;
  BODY_HTML_TEXT?: string;
  QUANTITY?: number;
  VENDOR_ID?: number;
  VENDOR_BRAND_NAME?: string | null;
  CATEGORY_NAME?: string | null;
  IMAGES_URLS?: string[];
  IMAGES_ALT_TEXT?: string[];
  STATUS?: string;
  createdAt?: string;
  updatedAt?: string;
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
  slug: string | null;
  title: string;
  vendorId?: number | undefined;
  vendor?: { brandName: string | null } | null;
  description: string | null;
  productType: string | null;
  tags: string | null;
  category?: { name: string | null } | null;
  images: string | null;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
}
