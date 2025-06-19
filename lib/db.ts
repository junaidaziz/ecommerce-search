import { prisma } from './prisma';

export default prisma;

export function dbGetCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}
