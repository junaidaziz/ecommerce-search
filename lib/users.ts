import { getDb } from './db';

const prisma = getDb();

export async function addUser({
  email,
  password,
  first_name,
  last_name,
  brand_name,
  gender,
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
}) {
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
      role,
      disabled: false,
      verificationToken: verification_token,
    },
  });
}

export function findUser(email) {
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

export function updateUserRole(email, role) {
  return prisma.user.update({ where: { email }, data: { role } });
}

export function setUserDisabled(email, disabled) {
  return prisma.user.update({ where: { email }, data: { disabled } });
}

export function deleteUser(email) {
  return prisma.user.delete({ where: { email } });
}

export function verifyUser(token) {
  return prisma.user.updateMany({
    where: { verificationToken: token },
    data: { verified: true, verificationToken: null },
  });
}

export function setResetToken(email, token, expires) {
  return prisma.user.update({
    where: { email },
    data: { resetToken: token, resetExpires: new Date(expires) },
  });
}

export function resetPassword(token, password) {
  return prisma.user.updateMany({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
    data: { password, resetToken: null, resetExpires: null },
  });
}

export function updateUserProfile(email, data) {
  return prisma.user.update({ where: { email }, data });
}
