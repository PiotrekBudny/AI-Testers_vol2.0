import { expect, test } from "../support/users/bystre-users-api.fixtures";
import { expectBystreLoginAuthState } from "../support/users/bystre-users-api.helpers";
import type {
  BystreErrorResponse,
  BystreLoginResponse,
} from "../support/users/bystre-users-api.models";

test.describe("Bystre API logout", () => {
  test(
    "revokes the user's refresh tokens",
    { tag: ["@bystre", "@auth", "@smoke"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const { user, token } = authenticatedUser;
      const signInResponse = await bystreUsersApi.login({
        username: user.username,
        password: user.password,
      });
      const signInBody = (await signInResponse.json()) as BystreLoginResponse;
      const refreshToken = signInBody.refreshToken ?? "";

      // Act
      const logoutResponse = await bystreUsersApi.logout(`Bearer ${token}`);
      const refreshResponse = await bystreUsersApi.refresh(refreshToken);
      const refreshBody = (await refreshResponse.json()) as BystreErrorResponse;

      // Assert
      expect(signInResponse.status()).toBe(200);
      expectBystreLoginAuthState(signInBody);
      expect(signInBody.mfaRequired).toBe(false);
      expect(signInBody.refreshToken).toEqual(expect.stringMatching(/\S+/));
      expect(logoutResponse.status()).toBe(200);
      expect(await logoutResponse.text()).toBe("");
      expect(refreshResponse.status()).toBe(401);
      expect(refreshBody).toMatchObject({
        message: expect.stringMatching(/invalid.*refresh token/i),
      });
    },
  );

  test(
    "rejects logout without an Authorization header",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      // Only the API client is requested; this check creates no user.

      // Act
      const response = await bystreUsersApi.logout();
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({ message: expect.stringMatching(/\S+/) });
    },
  );

  test(
    "rejects an invalid bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const invalidAuthorization = "Bearer invalid-token";

      // Act
      const response = await bystreUsersApi.logout(invalidAuthorization);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({ message: expect.stringMatching(/\S+/) });
    },
  );
});
