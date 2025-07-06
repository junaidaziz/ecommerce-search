export interface PriceValue {
  amount: number;
  currencyCode: string;
  formatted?: string;
}

export interface PriceRange {
  minVariantPrice: PriceValue;
  maxVariantPrice: PriceValue;
}

export interface PriceComparison {
  originalPrice: PriceValue;
  salePrice: PriceValue;
  discountPercentage: number;
  savings: PriceValue;
}

export interface PricingTier {
  quantity: number;
  price: PriceValue;
  discount?: number;
}

export interface BulkPricing {
  tiers: PricingTier[];
  basePrice: PriceValue;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate?: number;
}
