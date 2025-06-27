export interface Variant {
  id: number;
  uuid: string;
  productId: number;
  attributes: {
    size?: string;
    color?: string;
    material?: string;
    [key: string]: string | undefined;
  };
  quantity: number;
  priceModifier?: number | null;
}
