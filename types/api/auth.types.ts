import type { User } from '../user';

// Login response interface
export interface LoginResponse {
  message: string;
  user?: User;
}

// Signup response interface
export interface SignupResponse {
  message: string;
  user: User;
  token: string;
}

// Signup token response interface
export interface SignupTokenResponse {
  token: string;
  autoConfirmed?: boolean;
}

// Reset token response interface
export interface ResetTokenResponse {
  message: string;
  token: string;
}

// Email change tokens response interface
export interface EmailChangeTokensResponse {
  message: string;
  oldToken: string;
  newToken: string;
}
