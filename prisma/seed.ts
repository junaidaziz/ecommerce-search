import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  // Delete existing user (if any)
  await prisma.user.deleteMany({
    where: { email },
  });

  // Re-create Super Admin
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName: 'Junaid',
      lastName: 'Aziz',
      gender: 'Male',
      role: 'SUPER_ADMIN',
      verified: true,
    },
  });

  console.log(`✅ Super Admin user created with email: ${email}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to create Super Admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
