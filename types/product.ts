export interface Product {
  ID: string;
  SLUG: string;
  TITLE: string;
  VENDOR?: string;
  DESCRIPTION?: string;
  PRODUCT_TYPE?: string;
  TAGS?: string;
  CATEGORY?: string;
  IMAGES?: string[];
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
}
