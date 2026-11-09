import { requireBystreStatus } from "../support/users/bystre-user-lifecycle";
import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreMfaRecoveryCodesResponse,
  BystreMfaSetupResponse,
  BystreMfaStatusResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";
import { currentMfaCode } from "../support/users/bystre-users-mfa.helpers";

test.describe("AUTH-12 POST /api/v1/users/2fa/confirm", () => {
  test(
    "requires a bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const payload = { code: "123456" };

      // Act
      const response = await bystreUsersApi.confirmMfa(payload);
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
      const payload = { code: "123456" };
      const authorization = "Bearer invalid-bystre-test-token";

      // Act
      const response = await bystreUsersApi.confirmMfa(payload, authorization);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({ message: "Invalid or expired token" });
    },
  );

  test(
    "enables MFA and creates one-time recovery codes",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      test.setTimeout(30_000);
      const authorization = `Bearer ${authenticatedUser.token}`;
      const setupResponse = await requireBystreStatus(
        bystreUsersApi.setupMfa(authorization),
        "MFA setup",
        200,
      );
      const setup = (await setupResponse.json()) as BystreMfaSetupResponse;

      // Act
      const response = await bystreUsersApi.confirmMfa(
        { code: currentMfaCode(setup.secret) },
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
      expect(new Set(body.recoveryCodes).size).toBe(8);
      expect(body.recoveryCodes.every((code) => /\S+/.test(code))).toBe(true);
      expect(statusResponse.status()).toBe(200);
      expect(status).toEqual({ enabled: true, unusedRecoveryCodes: 8 });
    },
  );

  test(
    "rejects a missing code",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      await requireBystreStatus(
        bystreUsersApi.setupMfa(authorization),
        "MFA setup",
        200,
      );

      // Act
      const response = await bystreUsersApi.confirmMfa({}, authorization);
      const body = (await response.json()) as BystreValidationErrors;

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({ code: expect.any(String) });
    },
  );

  test(
    "rejects an incorrect authenticator code",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      await requireBystreStatus(
        bystreUsersApi.setupMfa(authorization),
        "MFA setup",
        200,
      );

      // Act
      const response = await bystreUsersApi.confirmMfa(
        { code: "000000" },
        authorization,
      );
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({
        message: expect.stringMatching(/invalid authenticator/i),
      });
    },
  );
});
