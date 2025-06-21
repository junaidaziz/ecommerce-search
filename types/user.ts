import type { Role } from '@prisma/client';

export interface User {
  id?: number | string;
  uuid?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: Role | string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  brandName?: string;
  gender?: string;
  verified?: boolean;
  disabled?: boolean;
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
