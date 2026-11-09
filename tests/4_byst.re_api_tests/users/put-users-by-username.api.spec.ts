import { randomUUID } from "node:crypto";

import { test as adminTest } from "../support/products/bystre-products-api.fixtures";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";
import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type { BystreUserResponse } from "../support/users/bystre-users-api.models";

test.describe(
  "PUT /api/v1/users/{username}",
  { tag: ["@bystre", "@users"] },
  () => {
    test("updates an account's email and names and persists the changes", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const { user, token } = authenticatedUser;
      const authorization = `Bearer ${token}`;
      const update = {
        email: `edited.${randomUUID()}@example.com`,
        firstName: "Lucia",
        lastName: "Brooks",
      };

      // Act
      const response = await bystreUsersApi.updateByUsername(
        user.username,
        update,
        authorization,
      );
      const updated = (await response.json()) as BystreUserResponse;
      const lookup = await bystreUsersApi.getByUsername(
        user.username,
        authorization,
      );
      const persisted = (await lookup.json()) as BystreUserResponse;

      // Assert
      expect(response.status()).toBe(200);
      expect(updated).toMatchObject({ username: user.username, ...update });
      expect(updated.roles).toContain("ROLE_CLIENT");
      expect(updated).not.toHaveProperty("password");
      expect(lookup.status()).toBe(200);
      expect(persisted).toMatchObject({ username: user.username, ...update });
    });

    test("prevents one client from changing another account", async ({
      bystreUsersApi,
      authenticatedUser,
      secondAuthenticatedUser,
    }) => {
      // Arrange
      const target = authenticatedUser.user;
      const update = { email: target.email, firstName: "Nolan" };
      const otherAuthorization = `Bearer ${secondAuthenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.updateByUsername(
        target.username,
        update,
        otherAuthorization,
      );
      const body = await response.json();
      const lookup = await bystreUsersApi.getByUsername(
        target.username,
        `Bearer ${authenticatedUser.token}`,
      );
      const persisted = (await lookup.json()) as BystreUserResponse;

      // Assert
      expect(response.status()).toBe(403);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
      expect(lookup.status()).toBe(200);
      expect(persisted.firstName).toBe(target.firstName);
    });

    test("rejects an invalid email", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.updateByUsername(
        authenticatedUser.user.username,
        { email: "invalid-email" },
        authorization,
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("email", expect.stringMatching(/\S+/));
    });

    test("requires an email in the edit request", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.updateByUsername(
        authenticatedUser.user.username,
        { firstName: "Lucia" },
        authorization,
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("email", expect.stringMatching(/\S+/));
    });

    test("reports a missing target account", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const username = `missing-${randomUUID()}`;
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.updateByUsername(
        username,
        { email: `missing.${randomUUID()}@example.com` },
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
        const response = await bystreUsersApi.updateByUsername(
          username,
          { email: `missing.${randomUUID()}@example.com` },
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

adminTest.describe(
  "PUT /api/v1/users/{username} as admin",
  { tag: ["@bystre", "@users", "@rbac", "@bystre-admin"] },
  () => {
    adminTest(
      "allows an administrator to edit a client account",
      async ({ bystreUsersApi, authenticatedUser, adminAuthorization }) => {
        // Arrange
        const target = authenticatedUser.user;
        const update = {
          email: `admin-edited.${randomUUID()}@example.com`,
          firstName: "Nolan",
          lastName: "Turner",
        };

        // Act
        const response = await bystreUsersApi.updateByUsername(
          target.username,
          update,
          adminAuthorization,
        );
        const updated = (await response.json()) as BystreUserResponse;
        const lookup = await bystreUsersApi.getByUsername(
          target.username,
          `Bearer ${authenticatedUser.token}`,
        );
        const persisted = (await lookup.json()) as BystreUserResponse;

        // Assert
        expect(response.status()).toBe(200);
        expect(updated).toMatchObject({ username: target.username, ...update });
        expect(lookup.status()).toBe(200);
        expect(persisted).toMatchObject({
          username: target.username,
          ...update,
        });
      },
    );
  },
);
