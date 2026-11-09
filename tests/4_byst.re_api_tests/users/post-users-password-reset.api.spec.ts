import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";

test.describe("AUTH-08 POST /api/v1/users/password/reset", () => {
  test(
    "rejects an unknown reset token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const payload = {
        token: "unknown-reset-token",
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      };

      // Act
      const response = await bystreUsersApi.resetPassword(payload);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        message: expect.stringMatching(/invalid password reset token/i),
      });
    },
  );

  test(
    "validates required fields",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const payload = {};

      // Act
      const response = await bystreUsersApi.resetPassword(payload);
      const body = (await response.json()) as BystreValidationErrors;

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        token: expect.any(String),
        newPassword: expect.any(String),
        confirmPassword: expect.any(String),
      });
    },
  );
});
