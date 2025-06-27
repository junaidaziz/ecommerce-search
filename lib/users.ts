import { getDb } from './db';
import type { Prisma, Role } from '@prisma/client';
import type { UserInput } from '@/types/user';
import bcrypt from 'bcryptjs';
import { slugify } from './slugify';

const prisma = getDb();

export async function addUser({
  email,
  password,
  firstName,
  lastName,
  brandName,
  gender = 'OTHER',
  phoneNumber,
  address,
  city,
  country,
  businessAddress,
  website,
  businessDescription,
  logo,
  taxId,
  stripeAccountId,
  role = 'USER',
  verificationToken,
}: UserInput): Promise<void> {
  await prisma.user.create({
    data: {
      email,
      password,
      firstName,
      lastName,
      brandName,
      gender,
      phoneNumber,
      address,
      city,
      country,
      businessAddress,
      website,
      businessDescription,
      logo,
      taxId,
      stripeAccountId,
      role: role as Role,
      disabled: false,
      verificationToken,
    },
  });
}

export function findUser(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: number | string) {
  return prisma.user.findUnique({ where: { id: Number(id) } });
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

export function setResetToken(
  email: string,
  token: string,
  expires: string | number | Date
) {
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

export async function changeEmail(
  currentEmail: string,
  token: string,
  newEmail: string
) {
  const user = await prisma.user.findFirst({
    where: {
      email: currentEmail,
      resetToken: token,
      resetExpires: { gt: new Date() },
    },
  });
  if (!user) throw new Error('Invalid token');
  const exists = await prisma.user.findUnique({ where: { email: newEmail } });
  if (exists) throw new Error('Email exists');
  await prisma.user.update({
    where: { email: currentEmail },
    data: { email: newEmail, resetToken: null, resetExpires: null },
  });
}

export function updateUserProfile(email: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { email }, data });
}

export function findVendorByName(brandName: string) {
  return prisma.user.findFirst({
    where: { role: 'BRAND', brandName },
    select: { id: true, brandName: true, email: true },
  });
}

export function getVendors(
  search = '',
  limit = 20,
  offset = 0
) {
  return prisma.user.findMany({
    where: {
      role: 'BRAND',
      brandName: { contains: search, mode: 'insensitive' },
    },
    select: { id: true, brandName: true, email: true },
    orderBy: { brandName: 'asc' },
    take: limit,
    skip: offset,
  });
}

export async function createVendor(name: string) {
  const slug = slugify(name);
  const email = `${slug}-${Date.now()}@example.com`;
  const password = await bcrypt.hash('password', 10);
  return prisma.user.create({
    data: {
      email,
      password,
      firstName: name,
      lastName: '',
      brandName: name,
      gender: 'OTHER',
      role: 'BRAND',
    },
  });
}
