import type { PolicyDocument as PrismaPolicy } from '@prisma/client';

export interface PolicyDocument extends PrismaPolicy {
  updatedByUser?: import('./user').User;
}
