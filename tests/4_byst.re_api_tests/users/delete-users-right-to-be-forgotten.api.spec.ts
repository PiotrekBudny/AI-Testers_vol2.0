import { randomUUID } from "node:crypto";

import { unauthorizedCases } from "../support/shared/bystre-api.assertions";
import { expect, test } from "../support/users/bystre-users-api.fixtures";

test.describe(
  "DELETE /api/v1/users/{username}/right-to-be-forgotten",
  { tag: ["@bystre", "@users", "@auth"] },
  () => {
    test("deletes an account with its own token", async ({
      bystreUsersApi,
      authenticatedUser,
      secondAuthenticatedUser,
      userCleanup,
    }) => {
      // Arrange
      const { user, token } = authenticatedUser;

      // Act
      const response = await bystreUsersApi.deleteOwnAccount(
        user.username,
        `Bearer ${token}`,
      );
      userCleanup(user, token, response.status() === 204);
      const lookup = await bystreUsersApi.getByUsername(
        user.username,
        `Bearer ${secondAuthenticatedUser.token}`,
      );
      const body = await lookup.json();

      // Assert
      expect(response.status()).toBe(204);
      expect(lookup.status()).toBe(404);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
    });

    test("prevents a client from deleting another account", async ({
      bystreUsersApi,
      authenticatedUser,
      secondAuthenticatedUser,
    }) => {
      // Arrange
      const target = secondAuthenticatedUser.user;
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.deleteOwnAccount(
        target.username,
        authorization,
      );
      const body = await response.json();
      const lookup = await bystreUsersApi.getByUsername(
        target.username,
        `Bearer ${secondAuthenticatedUser.token}`,
      );

      // Assert
      expect(response.status()).toBe(403);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
      expect(lookup.status()).toBe(200);
    });

    test("reports a missing account", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const username = `missing-${randomUUID()}`;
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.deleteOwnAccount(
        username,
        authorization,
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(404);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreUsersApi }) => {
        // Arrange
        const username = `missing-${randomUUID()}`;

        // Act
        const response = await bystreUsersApi.deleteOwnAccount(
          username,
          authorization,
        );
        const body = await response.json();

        // Assert
        expect(response.status()).toBe(401);
        expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
      });
    }
  },
);
