import { expect, test } from "@playwright/test";

import { BystreApiClient } from "./support/bystre-api.client";
import type {
  BystreErrorResponse,
  BystreValidationErrors,
} from "./support/bystre-api.models";
import { BystreTestDataGenerator } from "./support/bystre-test-data.generator";

test.describe("Bystre API signup", () => {
  // 201 Created: a valid request creates a new user account.
  test(
    "creates an account with valid generated signup data",
    { tag: ["@bystre", "@signup", "@smoke"] },
    async ({ request }) => {
      const api = new BystreApiClient(request);
      const response = await api.signup(
        BystreTestDataGenerator.signupRequest(),
      );

      expect(response.status()).toBe(201);
    },
  );

  // 400 Bad Request: field validation errors.
  test("reports missing required signup fields", async ({ request }) => {
    const api = new BystreApiClient(request);
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
    const api = new BystreApiClient(request);
    const response = await api.signup(
      BystreTestDataGenerator.signupRequest(),
      "Bearer invalid-token",
    );

    expect(response.status()).toBe(401);
    const body = (await response.json()) as BystreErrorResponse;
    expect(body).toMatchObject({ message: "Invalid or expired token" });
  });
});
