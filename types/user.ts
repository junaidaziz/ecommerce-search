export interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  brandName?: string;
  gender?: string;
  role?: string;
}

export type UserResponse = User;

export interface UserInput {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  brandName?: string;
  gender?: string;
}
