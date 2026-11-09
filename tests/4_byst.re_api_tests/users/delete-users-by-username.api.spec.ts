import { randomUUID } from "node:crypto";

import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe(
  "DELETE /api/v1/users/{username}",
  { tag: ["@bystre", "@users", "@rbac", "@bystre-admin"] },
  () => {
    test("deletes a client account and makes it unavailable", async ({
      bystreUsersApi,
      adminAuthorization,
      authenticatedUser,
      userCleanup,
    }) => {
      // Arrange
      const { user, token } = authenticatedUser;

      // Act
      const response = await bystreUsersApi.deleteByUsername(
        user.username,
        adminAuthorization,
      );
      userCleanup(user, token, response.status() === 204);
      const lookup = await bystreUsersApi.getByUsername(
        user.username,
        adminAuthorization,
      );
      const lookupBody = await lookup.json();

      // Assert
      expect(response.status()).toBe(204);
      expect(lookup.status()).toBe(404);
      expect(lookupBody).toHaveProperty(
        "message",
        expect.stringMatching(/\S+/),
      );
    });

    test("reports a missing user to an administrator", async ({
      bystreUsersApi,
      adminAuthorization,
    }) => {
      // Arrange
      const username = `missing-${randomUUID()}`;

      // Act
      const response = await bystreUsersApi.deleteByUsername(
        username,
        adminAuthorization,
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(404);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
    });

    test("prevents a client from deleting a real account", async ({
      bystreUsersApi,
      authenticatedUser,
      secondAuthenticatedUser,
    }) => {
      // Arrange
      const target = authenticatedUser.user;
      const otherAuthorization = `Bearer ${secondAuthenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.deleteByUsername(
        target.username,
        otherAuthorization,
      );
      const body = await response.json();
      const lookup = await bystreUsersApi.getByUsername(
        target.username,
        `Bearer ${authenticatedUser.token}`,
      );

      // Assert
      expect(response.status()).toBe(403);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
      expect(lookup.status()).toBe(200);
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreUsersApi }) => {
        // Arrange
        const username = `missing-${randomUUID()}`;

        // Act
        const response = await bystreUsersApi.deleteByUsername(
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
