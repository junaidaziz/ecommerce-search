import type { User as PrismaUser, Role } from '@prisma/client';

// Base User type extending Prisma User
export type User = PrismaUser & {
  // Additional computed fields
  name?: string; // Display name from auth providers
  paymentMethods?: PaymentMethod[];
};

// Input type for creating users
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
> & {
  uuid?: string;
  paymentMethods?: PaymentMethod[];
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

// Payment method type
export interface PaymentMethod {
  id: number;
  userId: number;
  provider: string;
  cardLast4: string;
  cardBrand: string;
  expMonth: number;
  expYear: number;
  token: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
