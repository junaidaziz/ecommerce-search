import type { PolicyDocument as PrismaPolicyDocument } from '@prisma/client';
import type { User } from './user';

// Base PolicyDocument type matching Prisma schema
export type PolicyDocument = PrismaPolicyDocument;

// PolicyDocument with relations (for app use)
export type PolicyDocumentWithRelations = PolicyDocument & {
  updatedByUser?: User;
};

// Policy document input for creating policies (matches Prisma fields)
export type PolicyDocumentInput = Pick<
  PrismaPolicyDocument,
  'type' | 'content' | 'updatedBy' | 'version'
>;

// Policy document update type
export type PolicyDocumentUpdate = Partial<Pick<PolicyDocument, 'content' | 'updatedBy'>>;

// Policy document response type
export type PolicyDocumentResponse = PolicyDocumentWithRelations;

// Policy document summary for lists
export type PolicyDocumentSummary = Pick<
  PolicyDocument,
  'id' | 'type' | 'version' | 'updatedAt'
> & {
  updatedByUser?: Pick<User, 'id' | 'firstName' | 'lastName'>;
};
