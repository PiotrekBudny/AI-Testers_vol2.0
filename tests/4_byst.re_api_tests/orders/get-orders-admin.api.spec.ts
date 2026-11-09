import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectApiError } from "../support/shared/bystre-api.assertions";

test.describe(
  "GET /api/v1/orders/admin",
  { tag: ["@bystre", "@rbac", "@bystre-admin"] },
  () => {
    test("returns paginated system orders to an administrator", async ({
      bystreAdminApi,
      adminAuthorization,
    }) => {
      // Arrange
      const authorization = adminAuthorization;

      // Act
      const response = await bystreAdminApi.getAdminOrders(authorization);

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(await response.json()).toMatchObject({
        content: expect.any(Array),
        pageNumber: expect.any(Number),
        pageSize: expect.any(Number),
        totalElements: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    test("rejects a regular client", async ({
      bystreAdminApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreAdminApi.getAdminOrders(authorization);

      // Assert
      await expectApiError(response, 403);
    });

    test("rejects a request without a token", async ({ bystreAdminApi }) => {
      // Arrange
      const authorization = undefined;

      // Act
      const response = await bystreAdminApi.getAdminOrders(authorization);

      // Assert
      await expectApiError(response, 401);
    });
  },
);
