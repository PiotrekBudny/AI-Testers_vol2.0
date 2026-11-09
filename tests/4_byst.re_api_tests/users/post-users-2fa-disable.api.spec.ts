import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreLoginResponse,
  BystreMfaStatusResponse,
  BystreTokenRefreshResponse,
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
    "disables MFA with a recovery code and revokes refresh tokens",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      test.setTimeout(45_000);
      const { recoveryCodes } = await enrollMfa(
        bystreUsersApi,
        authenticatedUser.token,
      );
      const challengeResponse = await bystreUsersApi.login({
        username: authenticatedUser.user.username,
        password: authenticatedUser.user.password,
      });
      const challenge = (await challengeResponse.json()) as BystreLoginResponse;
      const mfaSignInResponse = await bystreUsersApi.completeMfaSignIn({
        challengeToken: challenge.challengeToken ?? "",
        code: recoveryCodes[0],
      });
      const mfaSignIn = (await mfaSignInResponse.json()) as BystreLoginResponse;
      const beforeDisableResponse = await bystreUsersApi.refresh(
        mfaSignIn.refreshToken ?? "",
      );
      const beforeDisable =
        (await beforeDisableResponse.json()) as BystreTokenRefreshResponse;
      const authorization = `Bearer ${beforeDisable.token}`;

      // Act
      const response = await bystreUsersApi.disableMfa(
        { password: authenticatedUser.user.password, code: recoveryCodes[1] },
        authorization,
      );
      const revokedRefreshResponse = await bystreUsersApi.refresh(
        beforeDisable.refreshToken,
      );
      const revokedRefresh =
        (await revokedRefreshResponse.json()) as BystreErrorResponse;
      const statusResponse = await bystreUsersApi.getMfaStatus(authorization);
      const status = (await statusResponse.json()) as BystreMfaStatusResponse;
      const loginResponse = await bystreUsersApi.login({
        username: authenticatedUser.user.username,
        password: authenticatedUser.user.password,
      });
      const login = (await loginResponse.json()) as BystreLoginResponse;

      // Assert
      expect(challengeResponse.status()).toBe(200);
      expect(challenge.mfaRequired).toBe(true);
      expect(
        typeof challenge.challengeToken === "string" &&
          challenge.challengeToken.length > 0,
      ).toBe(true);
      expect(mfaSignInResponse.status()).toBe(200);
      expect(
        typeof mfaSignIn.refreshToken === "string" &&
          mfaSignIn.refreshToken.length > 0,
      ).toBe(true);
      expect(beforeDisableResponse.status()).toBe(200);
      expect(
        typeof beforeDisable.token === "string" &&
          beforeDisable.token.length > 0,
      ).toBe(true);
      expect(
        typeof beforeDisable.refreshToken === "string" &&
          beforeDisable.refreshToken.length > 0,
      ).toBe(true);
      expect(response.status()).toBe(200);
      expect(await response.text()).toBe("");
      expect(revokedRefreshResponse.status()).toBe(401);
      expect(revokedRefresh).toMatchObject({
        message: expect.stringMatching(/invalid.*refresh token/i),
      });
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
      test.setTimeout(30_000);
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
