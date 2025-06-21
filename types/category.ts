import type { Category as PrismaCategory } from '@prisma/client';

export type Category = PrismaCategory;

export type CategoryInput = Pick<PrismaCategory, 'name'>;
