import { randomUUID } from "node:crypto";
import { config } from "../config/environment";
import type { LoginCredentials, User } from "../models/User";

export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: `jane.tester+${randomUUID()}@example.com`,
    displayName: config.DEFAULT_TEST_USER_DISPLAY_NAME,
    password: config.DEFAULT_TEST_USER_PASSWORD,
    ...overrides,
  };
}

export const existingUsers: { emptyUser: LoginCredentials } = {
  emptyUser: {
    email: config.EXISTING_USER_EMAIL,
    password: config.EXISTING_USER_PASSWORD,
  },
};
