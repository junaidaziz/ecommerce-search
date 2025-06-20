import { getDb } from './db';
import type { Prisma, Role } from '@prisma/client';

const prisma = getDb();

export interface AddUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  brand_name?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  business_address?: string;
  website?: string;
  business_description?: string;
  logo?: string;
  tax_id?: string;
  role?: Role;
  verification_token?: string;
}

export async function addUser({
  email,
  password,
  first_name,
  last_name,
  brand_name,
  gender = 'OTHER',
  phone_number,
  address,
  city,
  country,
  business_address,
  website,
  business_description,
  logo,
  tax_id,
  role = 'USER',
  verification_token,
}: AddUserInput): Promise<void> {
  await prisma.user.create({
    data: {
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      brandName: brand_name,
      gender,
      phoneNumber: phone_number,
      address,
      city,
      country,
      businessAddress: business_address,
      website,
      businessDescription: business_description,
      logo,
      taxId: tax_id,
      role: role as Role,
      disabled: false,
      verificationToken: verification_token,
    },
  });
}

export function findUser(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function getAllUsers() {
  return prisma.user.findMany({
    select: {
      email: true,
      firstName: true,
      lastName: true,
      brandName: true,
      gender: true,
      role: true,
      disabled: true,
    },
  });
}

export function updateUserRole(email: string, role: Role) {
  return prisma.user.update({ where: { email }, data: { role } });
}

export function setUserDisabled(email: string, disabled: boolean) {
  return prisma.user.update({ where: { email }, data: { disabled } });
}

export function deleteUser(email: string) {
  return prisma.user.delete({ where: { email } });
}

export function verifyUser(token: string) {
  return prisma.user.updateMany({
    where: { verificationToken: token },
    data: { verified: true, verificationToken: null },
  });
}

export function setResetToken(email: string, token: string, expires: string | number | Date) {
  return prisma.user.update({
    where: { email },
    data: { resetToken: token, resetExpires: new Date(expires) },
  });
}

export function resetPassword(token: string, password: string) {
  return prisma.user.updateMany({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
    data: { password, resetToken: null, resetExpires: null },
  });
}

export function updateUserProfile(email: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { email }, data });
}
