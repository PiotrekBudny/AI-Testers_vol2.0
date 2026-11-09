import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreLoginResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";
import { BystreTestDataGenerator } from "../support/users/bystre-users-test-data.generator";

test.describe(
  "POST /api/v1/users/signup",
  { tag: ["@bystre", "@users", "@auth"] },
  () => {
    test(
      "creates a client account that can sign in",
      { tag: "@smoke" },
      async ({ bystreUsersApi, userCleanup }) => {
        // Arrange
        const user = BystreTestDataGenerator.signupRequest();

        // Act
        const response = await bystreUsersApi.signup(user);
        userCleanup(user, undefined, response.status() !== 201);
        const login = await bystreUsersApi.login({
          username: user.username,
          password: user.password,
        });
        const loginBody = (await login.json()) as BystreLoginResponse;
        userCleanup(user, loginBody.token ?? undefined);

        // Assert
        expect(response.status()).toBe(201);
        expect(login.status()).toBe(200);
        expect(loginBody).toMatchObject({
          username: user.username,
          email: user.email,
          mfaRequired: false,
          roles: expect.arrayContaining(["ROLE_CLIENT"]),
          token: expect.stringMatching(/\S+/),
        });
      },
    );

    test("reports missing required signup fields", async ({
      bystreUsersApi,
    }) => {
      // Arrange
      const request = {};

      // Act
      const response = await bystreUsersApi.signup(request);
      const body = (await response.json()) as BystreValidationErrors;

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        username: "Username is required",
        email: "Email is required",
        password: "Password is required",
        firstName: "firstName is required",
        lastName: "lastName is required",
      });
    });

    test("rejects an invalid email", async ({ bystreUsersApi }) => {
      // Arrange
      const user = BystreTestDataGenerator.signupRequest();

      // Act
      const response = await bystreUsersApi.signup({
        ...user,
        email: "invalid-email",
      });
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("email", expect.stringMatching(/\S+/));
    });

    test("rejects a duplicate username", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const duplicate = {
        ...BystreTestDataGenerator.signupRequest(),
        username: authenticatedUser.user.username,
      };

      // Act
      const response = await bystreUsersApi.signup(duplicate);
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
    });

    test("rejects a duplicate email", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const duplicate = {
        ...BystreTestDataGenerator.signupRequest(),
        email: authenticatedUser.user.email,
      };

      // Act
      const response = await bystreUsersApi.signup(duplicate);
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
    });

    test("reports a malformed JSON body as a bad request", async ({
      request,
    }) => {
      // Arrange
      const path = "/api/v1/users/signup";

      // Act
      const response = await request.post(path, {
        headers: { "Content-Type": "application/json" },
        data: "{",
      });
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        status: 400,
        error: expect.stringMatching(/\S+/),
        path,
      });
    });

    test("rejects a supplied invalid bearer token", async ({
      bystreUsersApi,
    }) => {
      // Arrange
      const user = BystreTestDataGenerator.signupRequest();

      // Act
      const response = await bystreUsersApi.signup(
        user,
        "Bearer invalid-token",
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(401);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
    });
  },
);
