import { Prisma } from '@prisma/client';

export type UserInfo = Pick<
  Prisma.User,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'brandName'
  | 'gender'
  | 'phoneNumber'
  | 'address'
  | 'city'
  | 'country'
> & { role: string };
