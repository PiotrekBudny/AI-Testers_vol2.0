import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreMfaRecoveryCodesResponse,
  BystreMfaStatusResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";
import {
  currentMfaCode,
  enrollMfa,
  nextMfaCode,
} from "../support/users/bystre-users-mfa.helpers";

test.describe("AUTH-14 POST /api/v1/users/2fa/recovery-codes", () => {
  test(
    "requires a bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const payload = { password: "invalid-password", code: "123456" };

      // Act
      const response = await bystreUsersApi.replaceMfaRecoveryCodes(payload);
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
      const response = await bystreUsersApi.replaceMfaRecoveryCodes(
        payload,
        authorization,
      );
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({ message: "Invalid or expired token" });
    },
  );

  test(
    "rotates recovery codes after a fresh authenticator code",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      test.setTimeout(60_000);
      const authorization = `Bearer ${authenticatedUser.token}`;
      const { secret, recoveryCodes } = await enrollMfa(
        bystreUsersApi,
        authenticatedUser.token,
      );
      const code = await nextMfaCode(secret, currentMfaCode(secret));

      // Act
      const response = await bystreUsersApi.replaceMfaRecoveryCodes(
        { password: authenticatedUser.user.password, code },
        authorization,
      );
      const body = (await response.json()) as BystreMfaRecoveryCodesResponse;
      const statusResponse = await bystreUsersApi.getMfaStatus(authorization);
      const status = (await statusResponse.json()) as BystreMfaStatusResponse;

      // Assert
      expect(response.status()).toBe(200);
      expect(
        Array.isArray(body.recoveryCodes) ? body.recoveryCodes.length : -1,
      ).toBe(8);
      expect(
        body.recoveryCodes.some((code) => recoveryCodes.includes(code)),
      ).toBe(false);
      expect(new Set(body.recoveryCodes).size).toBe(8);
      expect(statusResponse.status()).toBe(200);
      expect(status).toEqual({ enabled: true, unusedRecoveryCodes: 8 });
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
      const response = await bystreUsersApi.replaceMfaRecoveryCodes(
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
      const response = await bystreUsersApi.replaceMfaRecoveryCodes(
        {},
        authorization,
      );
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
