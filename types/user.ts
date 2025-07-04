import type { Role } from '@prisma/client';

export interface User {
  id?: number | string;
  uuid?: string;
  email: string;
  /** Optional display name from auth providers */
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  phoneNumber?: string | null;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  brandName?: string;
  gender?: string;
  businessAddress?: string;
  website?: string;
  businessDescription?: string;
  logo?: string;
  profileImage?: string;
  taxId?: string;
  stripeAccountId?: string;
  paymentMethods?: import('./vendor').BrandPaymentMethod[];
  verificationToken?: string;
  resetToken?: string;
  resetExpires?: Date;
  verified?: boolean;
  disabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserResponse = User;

export interface UserInput {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  brandName?: string;
  gender?: string;
  phoneNumber?: string | null;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  businessAddress?: string;
  website?: string;
  businessDescription?: string;
  logo?: string;
  profileImage?: string;
  taxId?: string;
  stripeAccountId?: string;
  paymentMethods?: import('./vendor').BrandPaymentMethod[];
  role?: Role;
  verificationToken?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRAND = 'BRAND',
  USER = 'USER',
}

export const getUserRoles = (): UserRole[] => {
  return Object.values(UserRole);
};
