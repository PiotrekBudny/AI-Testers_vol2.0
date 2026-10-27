import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreForgotPasswordResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";

test.describe("AUTH-07 POST /api/v1/users/password/forgot", () => {
  test(
    "accepts a disposable account without exposing a reset token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const identifier = authenticatedUser.user.username;

      // Act
      const response = await bystreUsersApi.forgotPassword(identifier);
      const body = (await response.json()) as BystreForgotPasswordResponse;

      // Assert
      expect(response.status()).toBe(202);
      expect(body).toMatchObject({
        message: expect.stringMatching(/reset instructions/i),
        token: null,
      });
    },
  );

  test(
    "accepts an unknown account without revealing whether it exists",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const identifier = "missing-bystre-security-account@example.com";

      // Act
      const response = await bystreUsersApi.forgotPassword(identifier);
      const body = (await response.json()) as BystreForgotPasswordResponse;

      // Assert
      expect(response.status()).toBe(202);
      expect(body).toMatchObject({
        message: expect.stringMatching(/reset instructions/i),
        token: null,
      });
    },
  );

  test(
    "rejects a missing identifier",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const identifier = undefined;

      // Act
      const response = await bystreUsersApi.forgotPassword(identifier);
      const body = (await response.json()) as BystreValidationErrors;

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({ identifier: expect.stringMatching(/\S+/) });
    },
  );
});
