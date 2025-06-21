export interface User {
  id?: string | number;
  uuid?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string | null;
  image?: string | null;
  brandName?: string;
  gender?: string;
  role?: string;
  disabled?: boolean;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  businessAddress?: string;
  website?: string;
  businessDescription?: string;
  logo?: string;
  taxId?: string;
}

export type UserResponse = User;

export interface UserInput {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  brandName?: string;
  gender?: string;
}
