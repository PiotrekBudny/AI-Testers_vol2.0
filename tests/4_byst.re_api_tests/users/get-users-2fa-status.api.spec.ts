import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreMfaStatusResponse,
} from "../support/users/bystre-users-api.models";
import { enrollMfa } from "../support/users/bystre-users-mfa.helpers";

test.describe("AUTH-13 GET /api/v1/users/2fa/status", () => {
  test(
    "reports disabled then enabled MFA for a disposable account",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      test.setTimeout(30_000);
      const authorization = `Bearer ${authenticatedUser.token}`;
      const initialResponse = await bystreUsersApi.getMfaStatus(authorization);
      const initial = (await initialResponse.json()) as BystreMfaStatusResponse;

      // Act
      await enrollMfa(bystreUsersApi, authenticatedUser.token);
      const enabledResponse = await bystreUsersApi.getMfaStatus(authorization);
      const enabled = (await enabledResponse.json()) as BystreMfaStatusResponse;

      // Assert
      expect(initialResponse.status()).toBe(200);
      expect(initial).toEqual({ enabled: false, unusedRecoveryCodes: 0 });
      expect(enabledResponse.status()).toBe(200);
      expect(enabled).toEqual({ enabled: true, unusedRecoveryCodes: 8 });
    },
  );

  test(
    "requires a bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const authorization = undefined;

      // Act
      const response = await bystreUsersApi.getMfaStatus(authorization);
      const body = (await response.json()) as BystreErrorResponse;

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({
        message: expect.stringMatching(/unauthorized/i),
      });
    },
  );
});
