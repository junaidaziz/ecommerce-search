export interface Vendor {
  id?: number | string;
  uuid?: string;
  /** Display name used for the brand */
  brandName: string | null;
  email: string;
  phoneNumber?: string | null | undefined;
  address?: string;
  city?: string;
  country?: string;
  businessAddress?: string;
  website?: string;
  description?: string;
  logo?: string;
  taxId?: string;
  paymentMethods?: BrandPaymentMethod[];
  status?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BrandPaymentMethod {
  type: 'stripe' | 'jazzcash' | 'bank_transfer';
  details?: string | null;
}
