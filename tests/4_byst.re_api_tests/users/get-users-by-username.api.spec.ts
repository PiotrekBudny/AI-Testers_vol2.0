import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";
import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type { BystreUserResponse } from "../support/users/bystre-users-api.models";

test.describe(
  "GET /api/v1/users/{username}",
  { tag: ["@bystre", "@users"] },
  () => {
    test("returns the requested user's public account details", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const { user, token } = authenticatedUser;

      // Act
      const response = await bystreUsersApi.getByUsername(
        user.username,
        `Bearer ${token}`,
      );

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/json");
      const body = (await response.json()) as BystreUserResponse;
      expect(body).toMatchObject({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: expect.arrayContaining(["ROLE_CLIENT"]),
      });
      expect(body).not.toHaveProperty("password");
      expect(body).not.toHaveProperty("token");
      expect(body).not.toHaveProperty("refreshToken");
    });

    test("reports a username that does not exist", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const missingUsername = `missing-${Date.now()}`;
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.getByUsername(
        missingUsername,
        authorization,
      );

      // Assert
      await expectApiError(response, 404);
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreUsersApi }) => {
        // Arrange
        const username = "unknown-user";

        // Act
        const response = await bystreUsersApi.getByUsername(
          username,
          authorization,
        );

        // Assert
        await expectApiError(response, 401);
      });
    }
  },
);
