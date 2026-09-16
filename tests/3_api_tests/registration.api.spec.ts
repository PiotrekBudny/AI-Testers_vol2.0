import { expect, test } from "@playwright/test";

import { ApiUrls } from "../../src/pages/urls";
import { createTestUser, existingUsers } from "../../src/test-data/users";
import {
  type ApiErrorResponse,
  type ApiSuccessResponse,
  readApiResponse,
  type RegisterResponseData,
} from "./api-test-helpers";

test(
  "registration succeeds with valid data",
  { tag: ["@auth", "@smoke"] },
  async ({ request }) => {
    // Arrange
    const newUser = createTestUser();

    // Act
    const response = await request.post(ApiUrls.register, {
      data: {
        email: newUser.email,
        password: newUser.password,
        displayedName: newUser.displayName,
      },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<RegisterResponseData>>(response);

    // Assert
    expect(response.status(), "Valid registration should return HTTP 201").toBe(
      201,
    );
    expect(body.success, "Valid registration should return success: true").toBe(
      true,
    );
    expect(
      body.data.user.email,
      "Registration response should echo back the submitted email",
    ).toBe(newUser.email);
    expect(
      body.data.user.displayedName,
      "Registration response should echo back the submitted display name",
    ).toBe(newUser.displayName);
    expect(
      body.data.token,
      "Registration response should include an access token",
    ).toEqual(expect.any(String));
  },
);

test(
  "registration succeeds without an optional displayed name",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const newUser = createTestUser();

    // Act
    const response = await request.post(ApiUrls.register, {
      data: { email: newUser.email, password: newUser.password },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<RegisterResponseData>>(response);

    // Assert
    expect(
      response.status(),
      "Registration without a displayedName should still return HTTP 201",
    ).toBe(201);
    expect(
      body.success,
      "Registration without a displayedName should return success: true",
    ).toBe(true);
    expect(
      body.data.user.email,
      "Registration response should echo back the submitted email",
    ).toBe(newUser.email);
  },
);

test(
  "registration fails with a duplicate email",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { emptyUser } = existingUsers;

    // Act
    const response = await request.post(ApiUrls.register, {
      data: {
        email: emptyUser.email,
        password: emptyUser.password,
        displayedName: "Duplicate Attempt",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Duplicate registration should return HTTP 409",
    ).toBe(409);
    expect(
      body.success,
      "Duplicate registration should return success: false",
    ).toBe(false);
    expect(
      body.error,
      "Duplicate registration should explain the conflict",
    ).toBe("User with this email already exists");
  },
);

test(
  "registration fails with missing required fields",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const emptyPayload = {};

    // Act
    const response = await request.post(ApiUrls.register, {
      data: emptyPayload,
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing registration fields should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Invalid registration should return success: false",
    ).toBe(false);
    expect(
      body.error,
      "Invalid registration should explain the validation failure",
    ).toContain("Validation failed");
  },
);

test(
  "registration fails with an invalid email format",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const invalidEmailUser = createTestUser({ email: "not-an-email" });

    // Act
    const response = await request.post(ApiUrls.register, {
      data: {
        email: invalidEmailUser.email,
        password: invalidEmailUser.password,
        displayedName: invalidEmailUser.displayName,
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Invalid email format should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Invalid email format should return success: false",
    ).toBe(false);
    expect(
      body.error,
      "Invalid email format should explain the email validation rule",
    ).toContain("Email must be in a valid format");
  },
);

test(
  "registration fails with a password shorter than the minimum length",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const shortPasswordUser = createTestUser({ password: "ab" });

    // Act
    const response = await request.post(ApiUrls.register, {
      data: {
        email: shortPasswordUser.email,
        password: shortPasswordUser.password,
        displayedName: shortPasswordUser.displayName,
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Password below the 3-character minimum should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Too-short password should return success: false",
    ).toBe(false);
    expect(
      body.error,
      "Too-short password should explain the password length rule",
    ).toContain("Password must be at least 3 characters long");
  },
);
