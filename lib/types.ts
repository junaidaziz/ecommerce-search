import { Prisma } from '@prisma/client';

export type UserInfo = Pick<
  Prisma.User,
  'email' | 'firstName' | 'lastName' | 'brandName' | 'gender' | 'role' | 'phoneNumber' | 'address' | 'city' | 'country'
>;
