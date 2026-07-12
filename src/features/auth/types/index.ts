export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  googleId?: string;
  hasPassword?: boolean;
  createdAt: string;
}
