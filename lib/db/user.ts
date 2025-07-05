import { Role } from '@prisma/client';
import { getDb } from '../db';

const prisma = getDb();

export async function assignUserRoleIfMissing(email: string, role: Role): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  if (user.role !== role) {
    await prisma.user.update({ where: { email }, data: { role } });
  }
}
