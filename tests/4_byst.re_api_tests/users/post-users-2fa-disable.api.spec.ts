import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreLoginResponse,
  BystreMfaStatusResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";
import { enrollMfa } from "../support/users/bystre-users-mfa.helpers";

test.describe("AUTH-15 POST /api/v1/users/2fa/disable", () => {
  test(
    "requires a bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const payload = { password: "invalid-password", code: "123456" };

      // Act
      const response = await bystreUsersApi.disableMfa(payload);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({ message: "Unauthorized" });
    },
  );

  test(
    "rejects an invalid bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const payload = { password: "invalid-password", code: "123456" };
      const authorization = "Bearer invalid-bystre-test-token";

      // Act
      const response = await bystreUsersApi.disableMfa(payload, authorization);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({ message: "Invalid or expired token" });
    },
  );

  test(
    "disables MFA with a recovery code",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const { recoveryCodes } = await enrollMfa(
        bystreUsersApi,
        authenticatedUser.token,
      );

      // Act
      const response = await bystreUsersApi.disableMfa(
        { password: authenticatedUser.user.password, code: recoveryCodes[0] },
        authorization,
      );
      const statusResponse = await bystreUsersApi.getMfaStatus(authorization);
      const status = (await statusResponse.json()) as BystreMfaStatusResponse;
      const loginResponse = await bystreUsersApi.login({
        username: authenticatedUser.user.username,
        password: authenticatedUser.user.password,
      });
      const login = (await loginResponse.json()) as BystreLoginResponse;

      // Assert
      expect(response.status()).toBe(200);
      expect(await response.text()).toBe("");
      expect(statusResponse.status()).toBe(200);
      expect(status).toEqual({ enabled: false, unusedRecoveryCodes: 0 });
      expect(loginResponse.status()).toBe(200);
      expect(login.mfaRequired).toBe(false);
      expect(typeof login.token === "string" && login.token.length > 0).toBe(
        true,
      );
      expect(login.challengeToken).toBeNull();
    },
  );

  test(
    "rejects a wrong current password",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const { recoveryCodes } = await enrollMfa(
        bystreUsersApi,
        authenticatedUser.token,
      );

      // Act
      const response = await bystreUsersApi.disableMfa(
        { password: "wrong-password", code: recoveryCodes[0] },
        authorization,
      );
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(422);
      expect(body).toMatchObject({
        message: expect.stringMatching(/invalid username\/password/i),
      });
    },
  );

  test(
    "validates required fields",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreUsersApi.disableMfa({}, authorization);
      const body = (await response.json()) as BystreValidationErrors;

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        password: expect.any(String),
        code: expect.any(String),
      });
    },
  );
});
