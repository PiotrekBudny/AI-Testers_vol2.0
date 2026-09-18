import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import type { ApiSuccessResponse } from "../../src/api/types/common";
import type { UserProfileData } from "../../src/api/types/system";
import { ApiUrls } from "../../src/api/urls";
import { readApiResponse, registerFreshUser } from "./api-test-helpers";

test.describe("User Profile Management", () => {
  test(
    "GET /users/profile returns current user's profile",
    { tag: ["@users", "@smoke"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();

      // Act
      const response = await request.get(ApiUrls.usersProfile, {
        headers: { token },
      });
      const body =
        await readApiResponse<ApiSuccessResponse<UserProfileData>>(response);

      // Assert
      expect(
        response.status(),
        "User profile retrieval should return HTTP 200",
      ).toBe(200);
      expect(
        body.success,
        "User profile retrieval should return success: true",
      ).toBe(true);
      expect(body.data).toHaveProperty("displayedName");
      expect(body.data).toHaveProperty("email");
      expect(body.data).toHaveProperty("id");
    },
  );

  test(
    "GET /users/profile without token returns 401",
    { tag: ["@users", "@auth"] },
    async ({ request }) => {
      // Act
      const response = await request.get(ApiUrls.usersProfile);

      // Assert
      expect(
        response.status(),
        "User profile retrieval without token should return HTTP 401",
      ).toBe(401);
    },
  );

  test(
    "PUT /users/profile updates user's profile",
    { tag: ["@users"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();
      const newDisplayName = "Updated Display Name";
      const newEmail = `updated-${randomUUID()}@example.com`;

      // Act
      const response = await request.put(ApiUrls.usersProfile, {
        headers: { token },
        data: {
          displayedName: newDisplayName,
          email: newEmail,
        },
      });
      const body =
        await readApiResponse<ApiSuccessResponse<UserProfileData>>(response);

      // Assert
      expect(
        response.status(),
        "User profile update should return HTTP 200",
      ).toBe(200);
      expect(
        body.success,
        "User profile update should return success: true",
      ).toBe(true);
      expect(body.data.displayedName).toBe(newDisplayName);
      expect(body.data.email).toBe(newEmail);
    },
  );

  test(
    "PUT /users/profile with invalid email returns 400",
    { tag: ["@users"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();

      // Act
      const response = await request.put(ApiUrls.usersProfile, {
        headers: { token },
        data: {
          displayedName: "Valid Name",
          email: "invalid-email",
        },
      });

      // Assert
      expect(
        response.status(),
        "User profile update with invalid email should return HTTP 400",
      ).toBe(400);
    },
  );

  test(
    "DELETE /users/{userId} deletes own account",
    { tag: ["@users"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();

      // Act
      const response = await request.delete(ApiUrls.usersProfile, {
        headers: { token },
      });
      const body = await readApiResponse<ApiSuccessResponse>(response);

      // Assert
      expect(response.status(), "Account deletion should return HTTP 200").toBe(
        200,
      );
      expect(body.success, "Account deletion should return success: true").toBe(
        true,
      );
    },
  );

  test(
    "DELETE /users/{userId} with non-existent ID returns 404",
    { tag: ["@users"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();
      const nonExistentUserId = 99999;

      // Act
      const response = await request.delete(
        ApiUrls.userById(String(nonExistentUserId)),
        { headers: { token } },
      );

      // Assert
      expect(
        response.status(),
        "Deletion of non-existent user should return HTTP 404",
      ).toBe(404);
    },
  );
});
