import { randomUUID } from "node:crypto";
import { config } from "../config/environment";
import type { LoginCredentials, User } from "../models/User";

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    email: `jane.tester+${randomUUID()}@example.com`,
    displayName: config.DEFAULT_TEST_USER_DISPLAY_NAME,
    password: config.DEFAULT_TEST_USER_PASSWORD,
    ...overrides,
  };
}

export const existingUsers: { emptyUser: LoginCredentials; demoUser: User } = {
  emptyUser: {
    email: config.EMPTY_USER_EMAIL,
    password: config.EMPTY_USER_PASSWORD,
  },
  demoUser: {
    email: config.DEMO_USER_EMAIL,
    displayName: config.DEMO_USER_DISPLAY_NAME,
    password: config.DEMO_USER_PASSWORD,
  },
};
