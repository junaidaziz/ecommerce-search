import type { User } from './user';

// Policy document interface matching Prisma schema
export interface PolicyDocument {
  id: number;
  type: string;
  content: string;
  version: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
  updatedByUser?: User;
}

// Policy document input for creating policies
export type PolicyDocumentInput = Pick<
  PolicyDocument,
  'type' | 'content' | 'updatedBy'
> & {
  version?: number;
};

// Policy document update interface
export type PolicyDocumentUpdate = Partial<Pick<PolicyDocument, 'content' | 'updatedBy'>>;

// Policy document response interface
export type PolicyDocumentResponse = PolicyDocument;

// Policy document summary for lists
export type PolicyDocumentSummary = Pick<
  PolicyDocument,
  'id' | 'type' | 'version' | 'updatedAt'
> & {
  updatedByUser?: Pick<User, 'id' | 'firstName' | 'lastName'>;
};
