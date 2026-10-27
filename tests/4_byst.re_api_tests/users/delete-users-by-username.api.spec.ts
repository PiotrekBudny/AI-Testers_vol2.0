import { randomUUID } from "node:crypto";

import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectApiError } from "../support/shared/bystre-api.assertions";
import {
  requireBystreStatus,
  signInBystreUser,
} from "../support/users/bystre-user-lifecycle";
import { BystreTestDataGenerator } from "../support/users/bystre-users-test-data.generator";

test.describe(
  "DELETE /api/v1/users/{username}",
  { tag: ["@bystre", "@users", "@rbac", "@bystre-admin"] },
  () => {
    test("deletes a disposable client account as an administrator", async ({
      bystreUsersApi,
      adminAuthorization,
      userCleanup,
    }) => {
      // Arrange
      const user = Object.freeze(BystreTestDataGenerator.signupRequest());
      await requireBystreStatus(
        bystreUsersApi.signup(user),
        "admin deletion target signup",
        201,
      );
      userCleanup(user);
      const token = await signInBystreUser(bystreUsersApi, user);
      userCleanup(user, token);

      // Act
      const response = await bystreUsersApi.deleteByUsername(
        user.username,
        adminAuthorization,
      );

      // Assert
      expect(response.status()).toBe(204);
      userCleanup(user, token, true);
    });

    test("rejects a regular client", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const username = `missing-${randomUUID()}`;
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.deleteByUsername(
        username,
        authorization,
      );

      // Assert
      await expectApiError(response, 403);
    });
  },
);
