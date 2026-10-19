import { BystreUsersApiClient } from "../support/users/bystre-users-api.client";
import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type {
  BystreErrorResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";
import { BystreTestDataGenerator } from "../support/users/bystre-users-test-data.generator";

test.describe("Bystre API signup", () => {
  // 201 Created: a valid request creates a new user account.
  test(
    "creates an account with valid generated signup data",
    { tag: ["@bystre", "@signup", "@smoke"] },
    async ({ request, userCleanup }) => {
      const api = new BystreUsersApiClient(request);
      const user = BystreTestDataGenerator.signupRequest();
      const response = await api.signup(user);
      expect(response.status()).toBe(201);
      userCleanup(user);
    },
  );

  // 400 Bad Request: field validation errors.
  test("reports missing required signup fields", async ({ request }) => {
    const api = new BystreUsersApiClient(request);
    const response = await api.signup({});

    expect(response.status()).toBe(400);

    const body = (await response.json()) as BystreValidationErrors;
    expect(body).toMatchObject({
      username: "Username is required",
      email: "Email is required",
      password: "Password is required",
      firstName: "firstName is required",
      lastName: "lastName is required",
    });
  });

  // 401 Unauthorized: the documented signup endpoint rejects an invalid Bearer token.
  test("rejects a supplied invalid Bearer token", async ({ request }) => {
    const api = new BystreUsersApiClient(request);
    const response = await api.signup(
      BystreTestDataGenerator.signupRequest(),
      "Bearer invalid-token",
    );

    expect(response.status()).toBe(401);
    const body = (await response.json()) as BystreErrorResponse;
    expect(body).toMatchObject({ message: "Invalid or expired token" });
  });
});
