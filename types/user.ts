import type { User as PrismaUser, Role } from '@prisma/client';
import type { PaymentMethod } from './paymentMethod';

// Base User type matching Prisma schema
export type User = PrismaUser;

// User with related payment methods (for queries that include them)
export type UserWithPaymentMethods = User & {
  PaymentMethod: PaymentMethod[];
};

// Input type for creating users (matches Prisma fields)
export type UserInput = Pick<
  PrismaUser,
  | 'email'
  | 'password'
  | 'firstName'
  | 'lastName'
  | 'brandName'
  | 'gender'
  | 'phoneNumber'
  | 'address'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country'
  | 'businessAddress'
  | 'website'
  | 'businessDescription'
  | 'logo'
  | 'profileImage'
  | 'taxId'
  | 'stripeAccountId'
  | 'role'
  | 'verificationToken'
  | 'verified'
  | 'disabled'
  | 'active'
  | 'resetToken'
  | 'resetExpires'
> & {
  uuid?: string;
};

// Update type for users
export type UserUpdate = Partial<Omit<UserInput, 'password' | 'email'>>;

// User response type
export type UserResponse = User;

// User with minimal fields for lists
export type UserSummary = Pick<
  PrismaUser,
  | 'id'
  | 'uuid'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'brandName'
  | 'role'
  | 'verified'
  | 'active'
  | 'createdAt'
>;

// User role enum (matching Prisma)
export type UserRole = Role;

// User role constants for runtime use
export const USER_ROLES = {
  USER: 'USER' as const,
  BRAND: 'BRAND' as const,
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
} as const;

// Helper function to get user roles
export const getUserRoles = (): Role[] => {
  return ['USER', 'BRAND', 'SUPER_ADMIN'] as Role[];
};
