import { randomUUID } from "node:crypto";
import type { LoginCredentials, User } from "../models/User";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: `jane.tester+${randomUUID()}@example.com`,
    displayName: requireEnv("DEFAULT_TEST_USER_DISPLAY_NAME"),
    password: requireEnv("DEFAULT_TEST_USER_PASSWORD"),
    ...overrides,
  };
}

export const existingUsers: { emptyUser: LoginCredentials } = {
  emptyUser: {
    email: requireEnv("EXISTING_USER_EMAIL"),
    password: requireEnv("EXISTING_USER_PASSWORD"),
  },
};
