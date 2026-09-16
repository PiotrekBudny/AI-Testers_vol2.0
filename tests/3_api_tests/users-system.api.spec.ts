import { expect, test } from "@playwright/test";

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../../src/api/types/common";
import type {
  PingResponse,
  SystemStatisticsData,
  UserProfileData,
} from "../../src/api/types/system";
import { ApiUrls } from "../../src/api/urls";
import { readApiResponse, registerFreshUser } from "./api-test-helpers";

test(
  "GET / returns the current system status payload",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange
    const rootUrl = "/api/v1/";

    // Act
    const response = await request.get(rootUrl);
    const body = await readApiResponse<ApiSuccessResponse>(response);

    // Assert
    expect(response.status(), "Root endpoint should return HTTP 200").toBe(200);
    expect(body.success, "Root endpoint should return success: true").toBe(
      true,
    );
    expect(body.data, "Root endpoint should return a data payload").toEqual(
      expect.any(Object),
    );
  },
);

test(
  "logout succeeds with a valid token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.logout, {
      headers: { token },
    });
    const body = await readApiResponse<ApiSuccessResponse>(response);

    // Assert
    expect(
      response.status(),
      "Logout with a valid token should return HTTP 200",
    ).toBe(200);
    expect(body.success, "Logout should return success: true").toBe(true);
  },
);

test(
  "logout succeeds without a token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.post(ApiUrls.logout);
    const body = await readApiResponse<ApiSuccessResponse>(response);

    // Assert
    expect(
      response.status(),
      "Logout without a token should return HTTP 200 per the schema (no security requirement declared)",
    ).toBe(200);
    expect(body.success, "Logout should return success: true").toBe(true);
  },
);

test(
  "GET /authorization succeeds with a valid token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token, user } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.authorization, {
      headers: { token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<UserProfileData>>(response);

    // Assert
    expect(
      response.status(),
      "Authorization check with a valid token should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Authorization check should return success: true",
    ).toBe(true);
    expect(
      body.data.email,
      "Authorization response should contain the current user's email",
    ).toBe(user.email);
  },
);

test(
  "GET /authorization fails with a missing token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.authorization);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Authorization check without a token should return HTTP 401",
    ).toBe(401);
    expect(
      body.success,
      "Authorization check without a token should return success: false",
    ).toBe(false);
  },
);

test(
  "GET /authorization fails with a malformed token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const garbageToken = "not-a-real-token-value";

    // Act
    const response = await request.get(ApiUrls.authorization, {
      headers: { token: garbageToken },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Authorization check with a malformed token should return HTTP 403",
    ).toBe(403);
    expect(
      body.success,
      "Authorization check with a malformed token should return success: false",
    ).toBe(false);
  },
);

test(
  "POST /authorization succeeds with a valid token in the body",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token, user } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.authorization, {
      data: { token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<UserProfileData>>(response);

    // Assert
    expect(
      response.status(),
      "Token validation with a valid token should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Token validation with a valid token should return success: true",
    ).toBe(true);
    expect(
      body.data.email,
      "Token validation response should contain the current user's email",
    ).toBe(user.email);
  },
);

test(
  "POST /authorization fails with an invalid token value",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const garbageToken = "not-a-real-token-value";

    // Act
    const response = await request.post(ApiUrls.authorization, {
      data: { token: garbageToken },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Token validation with an invalid token should return HTTP 401",
    ).toBe(401);
    expect(
      body.success,
      "Token validation with an invalid token should return success: false",
    ).toBe(false);
  },
);

test(
  "GET /healthcheck reports a healthy system",
  { tag: ["@system", "@smoke"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.healthcheck);
    const body = await readApiResponse<
      ApiSuccessResponse<{
        status: string;
        uptime: number;
        version: string;
        databaseValidation: Record<string, { status: string }>;
      }>
    >(response);

    // Assert
    expect(response.status(), "Healthcheck should return HTTP 200").toBe(200);
    expect(body.data.status, "Healthcheck status should be 'healthy'").toBe(
      "healthy",
    );
    expect(
      Object.values(body.data.databaseValidation).every(
        (db) => db.status === "ok",
      ),
      "Healthcheck should report all databases as connected/ok",
    ).toBe(true);
    expect(
      body.data.uptime,
      "Healthcheck should report a numeric uptime",
    ).toEqual(expect.any(Number));
    expect(
      body.data.version,
      "Healthcheck should report the application version as a string",
    ).toEqual(expect.any(String));
  },
);

test("GET /ping returns pong", { tag: ["@system"] }, async ({ request }) => {
  // Arrange

  // Act
  const response = await request.get(ApiUrls.ping);
  const body = await readApiResponse<PingResponse>(response);

  // Assert
  expect(response.status(), "Ping should return HTTP 200").toBe(200);
  expect(body.message, "Ping response message should be 'pong'").toBe("pong");
});

test(
  "GET /databases is not exposed under the versioned API prefix",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.databases);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Databases endpoint is not currently mounted at ApiUrls.databases and returns HTTP 404",
    ).toBe(404);
    expect(
      body.error,
      "Databases endpoint should explain the route was not found",
    ).toBe("API endpoint not found");
  },
);

test(
  "GET /memory is not exposed under the versioned API prefix",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.memory);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Memory endpoint is not currently mounted at ApiUrls.memory and returns HTTP 404",
    ).toBe(404);
    expect(
      body.error,
      "Memory endpoint should explain the route was not found",
    ).toBe("API endpoint not found");
  },
);

test(
  "GET /about returns application metadata",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.about);
    const body = await readApiResponse<ApiSuccessResponse>(response);

    // Assert
    expect(response.status(), "About endpoint should return HTTP 200").toBe(
      200,
    );
    expect(body.success, "About endpoint should return success: true").toBe(
      true,
    );
  },
);

test(
  "GET /documentation returns documentation payload",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.documentation);
    const body = await readApiResponse<ApiSuccessResponse>(response);

    // Assert
    expect(
      response.status(),
      "Documentation endpoint should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Documentation endpoint should return success: true",
    ).toBe(true);
  },
);

test(
  "GET /statistics returns system-wide statistics",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.statistics);
    const body = await readApiResponse<SystemStatisticsData>(response);

    // Assert
    expect(
      response.status(),
      "Statistics endpoint should return HTTP 200",
    ).toBe(200);
    expect(
      Number.isInteger(body.users),
      "Statistics users count should be an integer",
    ).toBe(true);
    expect(
      Number.isInteger(body.farms),
      "Statistics farms count should be an integer",
    ).toBe(true);
    expect(
      Number.isInteger(body.staff),
      "Statistics staff count should be an integer",
    ).toBe(true);
    expect(
      Number.isInteger(body.animals),
      "Statistics animals count should be an integer",
    ).toBe(true);
    expect(
      Number.isInteger(body.offers),
      "Statistics offers count should be an integer",
    ).toBe(true);
    expect(body.area, "Statistics area should be numeric").toEqual(
      expect.any(Number),
    );
    expect(
      body.avgStaffAge,
      "Statistics avgStaffAge should be numeric",
    ).toEqual(expect.any(Number));
  },
);

test(
  "GET /metrics reflects the disabled prometheus feature flag",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.metrics);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Metrics endpoint should return HTTP 404 when prometheusMetricsEnabled is false",
    ).toBe(404);
    expect(
      body.error,
      "Metrics endpoint should explain that the metrics route was not found",
    ).toBe("Metrics not found");
  },
);

test(
  "GET /debug is not exposed under the versioned API prefix",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.debug, {
      params: { all: "true" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Debug endpoint is not currently mounted at ApiUrls.debug and returns HTTP 404",
    ).toBe(404);
    expect(
      body.error,
      "Debug endpoint should explain the route was not found",
    ).toBe("API endpoint not found");
  },
);

test(
  "GET /logs is not exposed under the versioned API prefix",
  { tag: ["@system"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.logs);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Logs endpoint is not currently mounted at ApiUrls.logs and returns HTTP 404",
    ).toBe(404);
    expect(
      body.error,
      "Logs endpoint should explain the route was not found",
    ).toBe("API endpoint not found");
  },
);

test(
  "GET /users/profile succeeds with a valid token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token, user } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.usersProfile, {
      headers: { token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<UserProfileData>>(response);

    // Assert
    expect(
      response.status(),
      "Get profile with a valid token should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.email,
      "Profile response should contain the authenticated user's email",
    ).toBe(user.email);
  },
);

test(
  "GET /users/profile fails with a missing token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.usersProfile);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Get profile without a token should return HTTP 401",
    ).toBe(401);
    expect(
      body.success,
      "Get profile without a token should return success: false",
    ).toBe(false);
  },
);

test(
  "PUT /users/profile succeeds with a valid update",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const updatedDisplayName = "Updated Name";

    // Act
    const response = await request.put(ApiUrls.usersProfile, {
      headers: { token },
      data: { displayedName: updatedDisplayName },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<UserProfileData>>(response);

    // Assert
    expect(
      response.status(),
      "Valid profile update should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.displayedName,
      "Profile update response should echo the new displayed name",
    ).toBe(updatedDisplayName);
  },
);

test(
  "PUT /users/profile fails with an invalid email format",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.put(ApiUrls.usersProfile, {
      headers: { token },
      data: { email: "not-an-email" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Profile update with an invalid email format should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Profile update with an invalid email format should return success: false",
    ).toBe(false);
  },
);

test(
  "PUT /users/profile fails with a missing token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.put(ApiUrls.usersProfile, {
      data: { displayedName: "Nobody" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Profile update without a token should return HTTP 401",
    ).toBe(401);
    expect(
      body.success,
      "Profile update without a token should return success: false",
    ).toBe(false);
  },
);

test(
  "DELETE /users/profile deletes the account and invalidates its token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const deleteResponse = await request.delete(ApiUrls.usersProfile, {
      headers: { token },
    });
    const deleteBody =
      await readApiResponse<ApiSuccessResponse>(deleteResponse);
    const reuseResponse = await request.get(ApiUrls.usersProfile, {
      headers: { token },
    });
    const reuseBody = await readApiResponse<ApiErrorResponse>(reuseResponse);

    // Assert
    expect(
      deleteResponse.status(),
      "Deleting own profile should return HTTP 200",
    ).toBe(200);
    expect(
      deleteBody.success,
      "Deleting own profile should return success: true",
    ).toBe(true);
    expect(
      reuseResponse.status(),
      "Reusing a token from a deleted account should return HTTP 404 since the user no longer exists",
    ).toBe(404);
    expect(
      reuseBody.error,
      "Reusing a token from a deleted account should explain the user was not found",
    ).toBe("User not found");
  },
);

test(
  "PUT /users/{userId} succeeds when userId matches the caller",
  { tag: ["@auth", "@rbac"] },
  async ({ request }) => {
    // Arrange
    const { token, userId } = await registerFreshUser();
    const updatedDisplayName = "Self Update";

    // Act
    const response = await request.put(ApiUrls.userById(String(userId)), {
      headers: { token },
      data: { displayedName: updatedDisplayName },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<UserProfileData>>(response);

    // Assert
    expect(
      response.status(),
      "Updating own user record should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.displayedName,
      "Update response should echo the new displayed name",
    ).toBe(updatedDisplayName);
  },
);

test(
  "PUT /users/{userId} fails when userId belongs to another user",
  { tag: ["@auth", "@rbac"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const { userId: otherUserId } = await registerFreshUser();

    // Act
    const response = await request.put(ApiUrls.userById(String(otherUserId)), {
      headers: { token },
      data: { displayedName: "Hijacked" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Updating another user's record should return HTTP 403",
    ).toBe(403);
    expect(
      body.success,
      "Updating another user's record should return success: false",
    ).toBe(false);
  },
);

test(
  "PUT /users/{userId} fails with a missing token",
  { tag: ["@auth", "@rbac"] },
  async ({ request }) => {
    // Arrange
    const { userId } = await registerFreshUser();

    // Act
    const response = await request.put(ApiUrls.userById(String(userId)), {
      data: { displayedName: "Nobody" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Updating a user record without a token should return HTTP 401",
    ).toBe(401);
    expect(
      body.success,
      "Updating a user record without a token should return success: false",
    ).toBe(false);
  },
);

test(
  "GET /users/statistics succeeds with a valid token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.usersStatistics, {
      headers: { token },
    });
    const body = await readApiResponse<ApiSuccessResponse>(response);

    // Assert
    expect(
      response.status(),
      "User statistics with a valid token should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "User statistics with a valid token should return success: true",
    ).toBe(true);
  },
);

test(
  "GET /users/statistics fails with a missing token",
  { tag: ["@auth"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.usersStatistics);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "User statistics without a token should return HTTP 401",
    ).toBe(401);
    expect(
      body.success,
      "User statistics without a token should return success: false",
    ).toBe(false);
  },
);

test(
  "GET /users/statistics/all fails with a non-admin token",
  { tag: ["@auth", "@rbac"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.usersStatisticsAll, {
      headers: { token },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "All-users statistics with a non-admin token should return HTTP 403",
    ).toBe(403);
    expect(
      body.success,
      "All-users statistics with a non-admin token should return success: false",
    ).toBe(false);
  },
);

test(
  "GET /users/statistics/all fails with a missing token",
  { tag: ["@auth", "@rbac"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.usersStatisticsAll);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "All-users statistics without a token should return HTTP 401",
    ).toBe(401);
    expect(
      body.success,
      "All-users statistics without a token should return success: false",
    ).toBe(false);
  },
);
