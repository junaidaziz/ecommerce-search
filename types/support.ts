import type { SupportTicket as PrismaTicket } from '@prisma/client';

export interface SupportTicket extends PrismaTicket {
  user?: import('./user').User;
}
