import { expect, test } from "@playwright/test";

import { ApiUrls } from "../../src/pages/urls";
import { existingUsers } from "../../src/test-data/users";
import {
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type LoginResponseData,
  readApiResponse,
} from "./api-test-helpers";

test(
  "login succeeds with valid credentials",
  { tag: ["@auth", "@smoke"] },
  async ({ request }) => {
    // Arrange
    const { emptyUser } = existingUsers;

    // Act
    const response = await request.post(ApiUrls.login, {
      data: { email: emptyUser.email, password: emptyUser.password },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<LoginResponseData>>(response);

    // Assert
    expect(response.status(), "Valid login should return HTTP 200").toBe(200);
    expect(body.success, "Valid login should return success: true").toBe(true);
    expect(
      body.data.user.email,
      "Login response should contain the authenticated user's email",
    ).toBe(emptyUser.email);
    expect(
      body.data.token,
      "Login response should contain an access token",
    ).toEqual(expect.any(String));
  },
);

test(
  "login fails with invalid credentials",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const invalidCredentials = {
      email: "nonexistent.user@example.com",
      password: "wrongPassword",
    };

    // Act
    const response = await request.post(ApiUrls.login, {
      data: invalidCredentials,
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "Invalid login should return HTTP 401").toBe(401);
    expect(body.success, "Invalid login should return success: false").toBe(
      false,
    );
    expect(
      body.error,
      "Invalid login should explain why authentication failed",
    ).toBe("Invalid credentials");
  },
);
