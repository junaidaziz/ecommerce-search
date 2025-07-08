import type { SupportTicket as PrismaSupportTicket } from '@prisma/client';
import type { User } from './user';

// Base SupportTicket type matching Prisma schema
export type SupportTicket = PrismaSupportTicket;

// SupportTicket with relations (for app use)
export type SupportTicketWithRelations = SupportTicket & {
  user?: User;
};

// Support ticket input for creating tickets (matches Prisma fields)
export type SupportTicketInput = Pick<
  PrismaSupportTicket,
  'subject' | 'message' | 'userId' | 'uuid'
>;

// Support ticket update type
export type SupportTicketUpdate = Partial<Pick<SupportTicket, 'subject' | 'message' | 'status'>>;

// Support ticket response type
export type SupportTicketResponse = SupportTicketWithRelations;

// Support ticket summary for lists
export type SupportTicketSummary = Pick<
  SupportTicket,
  'id' | 'uuid' | 'subject' | 'status' | 'createdAt'
> & {
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
};
