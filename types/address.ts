import type { Address as PrismaAddress } from '@prisma/client';

// Base Address type matching Prisma schema
export type Address = PrismaAddress;

// Input type for creating addresses
export type AddressInput = Omit<
  PrismaAddress,
  'id' | 'uuid' | 'userId' | 'createdAt' | 'updatedAt'
>;

// Update type for addresses
export type AddressUpdate = Partial<AddressInput>;

// Address response type
export type AddressResponse = Address;

// Address summary for lists
export type AddressSummary = Pick<
  PrismaAddress,
  | 'id'
  | 'uuid'
  | 'type'
  | 'fullName'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country'
  | 'phoneNumber'
  | 'isDefault'
>;
