import type { User } from './user';

// Support ticket interface matching Prisma schema
export interface SupportTicket {
  id: number;
  uuid: string;
  userId?: number | null;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// Support ticket input for creating tickets
export type SupportTicketInput = Pick<
  SupportTicket,
  'subject' | 'message'
> & {
  userId?: number;
  uuid?: string;
};

// Support ticket update interface
export type SupportTicketUpdate = Partial<Pick<SupportTicket, 'subject' | 'message' | 'status'>>;

// Support ticket response interface
export type SupportTicketResponse = SupportTicket;

// Support ticket summary for lists
export type SupportTicketSummary = Pick<
  SupportTicket,
  'id' | 'uuid' | 'subject' | 'status' | 'createdAt'
> & {
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
};
