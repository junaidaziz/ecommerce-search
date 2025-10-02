import type { User } from '../user';

// Users response interface
export interface UsersResponse {
  users: (User & { disabled?: boolean })[];
}
