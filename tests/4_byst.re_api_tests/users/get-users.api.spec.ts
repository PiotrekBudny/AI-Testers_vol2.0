import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";
import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type { BystreUserResponse } from "../support/users/bystre-users-api.models";

test.describe("GET /api/v1/users", { tag: ["@bystre", "@users"] }, () => {
  test("returns user accounts to an authenticated client", async ({
    bystreUsersApi,
    authenticatedUser,
    secondAuthenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const response = await bystreUsersApi.getAll(authorization);

    // Assert
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    const users = (await response.json()) as BystreUserResponse[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    for (const user of users) {
      expect(user).toMatchObject({
        id: expect.any(Number),
        username: expect.stringMatching(/\S+/),
        email: expect.any(String),
        roles: expect.any(Array),
      });
      for (const role of user.roles) expect(role).toMatch(/^ROLE_/);
      expect(user).not.toHaveProperty("password");
    }
    expect(new Set(users.map((user) => user.id)).size).toBe(users.length);
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          username: authenticatedUser.user.username,
          email: authenticatedUser.user.email,
          roles: expect.arrayContaining(["ROLE_CLIENT"]),
        }),
        expect.objectContaining({
          username: secondAuthenticatedUser.user.username,
          email: secondAuthenticatedUser.user.email,
          roles: expect.arrayContaining(["ROLE_CLIENT"]),
        }),
      ]),
    );
  });

  for (const { name, authorization } of unauthorizedCases) {
    test("rejects " + name, async ({ bystreUsersApi }) => {
      // Arrange
      // Act
      const response = await bystreUsersApi.getAll(authorization);

      // Assert
      await expectApiError(response, 401);
    });
  }
});
