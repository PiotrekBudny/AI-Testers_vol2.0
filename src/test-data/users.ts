import { randomUUID } from "node:crypto";

export interface TestUser {
  email: string;
  displayName: string;
  password: string;
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    email: `jane.tester+${randomUUID()}@example.com`,
    displayName: "Jane Tester",
    password: "SecurePass123",
    ...overrides,
  };
}
