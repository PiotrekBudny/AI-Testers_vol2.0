import { expect, test } from "@playwright/test";

import { config } from "../../../src/config/environment";
import { BystreUsersApiClient } from "../support/users/bystre-users-api.client";
import {
  expectBystreLoginAuthState,
  requiredBystreCredential,
} from "../support/users/bystre-users-api.helpers";
import type {
  BystreErrorResponse,
  BystreLoginResponse,
  BystreValidationErrors,
} from "../support/users/bystre-users-api.models";

test.describe("Bystre API login", () => {
  test(
    "returns a session or MFA challenge for valid credentials",
    { tag: ["@bystre", "@auth", "@smoke", "@bystre-credentials"] },
    async ({ request }) => {
      const api = new BystreUsersApiClient(request);
      const username = requiredBystreCredential(
        config.BYSTRE_API_USERNAME,
        "BYSTRE_API_USERNAME",
      );
      const response = await api.login({
        username,
        password: requiredBystreCredential(
          config.BYSTRE_API_PASSWORD,
          "BYSTRE_API_PASSWORD",
        ),
      });

      await expect(response).toBeOK();

      const body = (await response.json()) as BystreLoginResponse;
      expect(body).toMatchObject({
        username,
        email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        firstName: body.firstName === null ? null : expect.any(String),
        lastName: body.lastName === null ? null : expect.any(String),
        roles: expect.arrayContaining([expect.any(String)]),
        mfaRequired: expect.any(Boolean),
      });

      for (const role of body.roles) {
        expect(role).toMatch(/^ROLE_(ADMIN|CLIENT)$/);
      }

      expectBystreLoginAuthState(body);
    },
  );

  // 400 Bad Request: validation failures.
  test("rejects a username shorter than the documented minimum", async ({
    request,
  }) => {
    const api = new BystreUsersApiClient(request);
    const response = await api.login({
      username: "abc",
      password: "valid-test-password",
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as BystreValidationErrors;
    expect(body).toMatchObject({
      username: expect.stringMatching(/4|length|short|minimum/i),
    });
  });

  // 401 Unauthorized: the public login endpoint rejects a supplied invalid Bearer token.
  test("rejects an invalid Bearer token", async ({ request }) => {
    const api = new BystreUsersApiClient(request);
    const response = await api.login(
      { username: "valid-test-user", password: "valid-test-password" },
      "Bearer invalid-token",
    );

    expect(response.status()).toBe(401);

    const body = (await response.json()) as BystreErrorResponse;
    expect(body).toMatchObject({ message: "Invalid or expired token" });
  });

  // 422 Unprocessable Entity: syntactically valid but invalid credentials.
  test("rejects unknown credentials", async ({ request }) => {
    const api = new BystreUsersApiClient(request);
    const response = await api.login({
      username: "unknown-bystre-api-test-user",
      password: "not-a-valid-test-password",
    });

    expect(response.status()).toBe(422);

    const body = (await response.json()) as BystreErrorResponse;
    expect(body).toMatchObject({
      message: expect.stringMatching(/unauthorized|invalid|credential/i),
    });
  });
});
