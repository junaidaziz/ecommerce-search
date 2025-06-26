export interface Brand {
  id?: number | string;
  uuid?: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EarningsData {
  totalEarned: number;
  pending: number;
  orders: import('./order').Order[];
}
