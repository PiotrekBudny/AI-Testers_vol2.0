import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreMfaSetupResponse,
} from "../support/users/bystre-users-api.models";

test.describe("AUTH-11 POST /api/v1/users/2fa/setup", () => {
  test(
    "creates a pending authenticator setup",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.setupMfa(authorization);
      const body = (await response.json()) as BystreMfaSetupResponse;

      // Assert
      expect(response.status()).toBe(200);
      expect(/^[A-Z2-7]+=*$/.test(body.secret)).toBe(true);
      expect(body.secret.length > 0).toBe(true);
      expect(body.otpAuthUri.startsWith("otpauth://totp/")).toBe(true);
      expect(body.qrCodeDataUri.startsWith("data:image/png;base64,")).toBe(
        true,
      );
      expect(Number.isNaN(Date.parse(body.expiresAt))).toBe(false);
    },
  );

  test(
    "requires a bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const authorization = undefined;

      // Act
      const response = await bystreUsersApi.setupMfa(authorization);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({
        message: expect.stringMatching(/unauthorized/i),
      });
    },
  );
});
