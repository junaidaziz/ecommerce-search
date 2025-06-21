import type { Role } from '@prisma/client';

export interface User {
  id?: number;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  name?: string | null;
  image?: string | null;
  brandName?: string | null;
  gender?: string;
  role?: Role | string;
  verified?: boolean;
  disabled?: boolean;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  businessAddress?: string | null;
  website?: string | null;
  businessDescription?: string | null;
  logo?: string | null;
  taxId?: string | null;
  verificationToken?: string | null;
  resetToken?: string | null;
  resetExpires?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
