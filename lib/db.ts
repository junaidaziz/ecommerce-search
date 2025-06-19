import { prisma } from './prisma';

export const getDb = () => prisma;
export default prisma;

export function dbGetCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}
