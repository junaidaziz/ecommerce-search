export interface PriceValue {
  amount: number;
  currencyCode: string;
}

export interface PriceRange {
  minVariantPrice: PriceValue;
  maxVariantPrice: PriceValue;
}
