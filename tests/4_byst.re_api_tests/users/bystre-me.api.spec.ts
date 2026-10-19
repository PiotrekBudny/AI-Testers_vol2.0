import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreUserResponse,
} from "../support/users/bystre-users-api.models";

function withModifiedSignature(token: string): string {
  const segments = token.split(".");
  if (segments.length !== 3 || segments.some((segment) => !segment)) {
    throw new Error("Sign-in must issue a signed JWT with three segments.");
  }

  const [header, payload, signature] = segments;
  const replacement = signature[0] === "A" ? "B" : "A";
  return `${header}.${payload}.${replacement}${signature.slice(1)}`;
}

test.describe("Bystre API current user", () => {
  test(
    "returns the newly registered user for a valid JWT",
    { tag: ["@bystre", "@auth", "@smoke"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const { user, token } = authenticatedUser;

      // Act
      const response = await bystreUsersApi.getMe(`Bearer ${token}`);

      // Assert
      expect(response.status()).toBe(200);
      const body = (await response.json()) as BystreUserResponse;
      expect(body).toMatchObject({
        id: expect.any(Number),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: expect.arrayContaining(["ROLE_CLIENT"]),
      });
      expect(Number.isInteger(body.id)).toBe(true);
      expect(body.id).toBeGreaterThan(0);
      expect(body.roles).not.toContain("ROLE_ADMIN");
      expect(body).not.toHaveProperty("password");
      expect(body).not.toHaveProperty("token");
      expect(body).not.toHaveProperty("accessToken");
      expect(body).not.toHaveProperty("refreshToken");
    },
  );

  test(
    "rejects a request without an Authorization header",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      // Only the unauthenticated API client is requested; no user is registered.

      // Act
      const response = await bystreUsersApi.getMe();

      // Assert
      expect(response.status()).toBe(401);
      const body = (await response.json()) as BystreErrorResponse;
      expect(body).toMatchObject({ message: expect.stringMatching(/\S+/) });
    },
  );

  test(
    "rejects a malformed bearer token",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi }) => {
      // Arrange
      const authorization = "Bearer not.a.jwt";

      // Act
      const response = await bystreUsersApi.getMe(authorization);

      // Assert
      expect(response.status()).toBe(401);
      const body = (await response.json()) as BystreErrorResponse;
      expect(body).toMatchObject({ message: expect.stringMatching(/\S+/) });
    },
  );

  test(
    "rejects a JWT with a modified signature",
    { tag: ["@bystre", "@auth"] },
    async ({ bystreUsersApi, authenticatedUser }) => {
      // Arrange
      const tamperedToken = withModifiedSignature(authenticatedUser.token);

      // Act
      const response = await bystreUsersApi.getMe(`Bearer ${tamperedToken}`);

      // Assert
      expect(response.status()).toBe(401);
      const body = (await response.json()) as BystreErrorResponse;
      expect(body).toMatchObject({ message: expect.stringMatching(/\S+/) });
    },
  );
});
