import { expect, test } from "../support/users/bystre-users-api.fixtures";
import { expectBystreLoginAuthState } from "../support/users/bystre-users-api.helpers";
import type {
  BystreErrorResponse,
  BystreLoginResponse,
  BystreTokenRefreshResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";

test.describe("Bystre API refresh token", () => {
  test(
    "rotates a valid refresh token and rejects reuse of the old token",
    { tag: ["@bystre", "@auth", "@smoke"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const { user } = authenticatedUser;
      const signInResponse = await bystreUsersApi.login({
        username: user.username,
        password: user.password,
      });
      const signInBody = (await signInResponse.json()) as BystreLoginResponse;
      const originalRefreshToken = signInBody.refreshToken ?? "";

      // Act
      const refreshResponse =
        await bystreUsersApi.refresh(originalRefreshToken);
      const refreshedTokens =
        (await refreshResponse.json()) as BystreTokenRefreshResponse;
      const reuseResponse = await bystreUsersApi.refresh(originalRefreshToken);
      const reuseBody = (await reuseResponse.json()) as BystreErrorResponse;

      // Assert
      expect(signInResponse.status()).toBe(200);
      expectBystreLoginAuthState(signInBody);
      expect(signInBody.mfaRequired).toBe(false);
      expect(signInBody.refreshToken).toEqual(expect.stringMatching(/\S+/));
      expect(refreshResponse.status()).toBe(200);
      expect(refreshedTokens).toMatchObject({
        token: expect.stringMatching(/\S+/),
        refreshToken: expect.stringMatching(/\S+/),
      });
      expect(refreshedTokens.refreshToken).not.toBe(originalRefreshToken);
      expect(reuseResponse.status()).toBe(401);
      expect(reuseBody).toMatchObject({
        message: expect.stringMatching(/invalid.*refresh token/i),
      });
    },
  );

  test(
    "reports a validation error when the refresh token is blank",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const blankRefreshToken = "  ";

      // Act
      const response = await bystreUsersApi.refresh(blankRefreshToken);
      const body = (await response.json()) as BystreValidationErrors;

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        refreshToken: expect.stringMatching(/\S+/),
      });
    },
  );

  test(
    "rejects an unknown refresh token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const unknownRefreshToken = "unknown-bystre-refresh-token";

      // Act
      const response = await bystreUsersApi.refresh(unknownRefreshToken);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({
        message: expect.stringMatching(/invalid.*refresh token/i),
      });
    },
  );
});
