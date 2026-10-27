import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreLoginResponse,
} from "../support/users/bystre-users-api.models";
import { enrollMfa } from "../support/users/bystre-users-mfa.helpers";

test.describe("AUTH-10 POST /api/v1/users/signin/2fa", () => {
  test(
    "exchanges a password challenge and recovery code for tokens",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const { recoveryCodes } = await enrollMfa(
        bystreUsersApi,
        authenticatedUser.token,
      );
      const passwordResponse = await bystreUsersApi.login({
        username: authenticatedUser.user.username,
        password: authenticatedUser.user.password,
      });
      const challenge = (await passwordResponse.json()) as BystreLoginResponse;

      // Act
      const response = await bystreUsersApi.completeMfaSignIn({
        challengeToken: challenge.challengeToken ?? "",
        code: recoveryCodes[0],
      });
      const body = (await response.json()) as BystreLoginResponse;

      // Assert
      expect(passwordResponse.status()).toBe(200);
      expect(challenge.mfaRequired).toBe(true);
      expect(challenge.token).toBeNull();
      expect(challenge.refreshToken).toBeNull();
      expect(
        typeof challenge.challengeToken === "string" &&
          challenge.challengeToken.length > 0,
      ).toBe(true);
      expect(response.status()).toBe(200);
      expect(body.username).toBe(authenticatedUser.user.username);
      expect(body.mfaRequired).toBe(false);
      expect(typeof body.token === "string" && body.token.length > 0).toBe(
        true,
      );
      expect(
        typeof body.refreshToken === "string" && body.refreshToken.length > 0,
      ).toBe(true);
      expect(body.challengeToken).toBeNull();
    },
  );

  test(
    "rejects an unknown challenge",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const payload = {
        challengeToken: "unknown-mfa-challenge",
        code: "123456",
      };

      // Act
      const response = await bystreUsersApi.completeMfaSignIn(payload);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({
        message: expect.stringMatching(/invalid or expired MFA challenge/i),
      });
    },
  );
});
