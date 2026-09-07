export interface User {
  email: string;
  displayName: string;
  password: string;
}

export type LoginCredentials = Pick<User, "email" | "password">;
