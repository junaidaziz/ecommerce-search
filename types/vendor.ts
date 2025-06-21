export interface Vendor {
  id?: number;
  uuid?: string;
  name?: string;
  /** Display name used for the brand */
  brandName?: string;
  email: string;
  company?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  description?: string;
  taxId?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
