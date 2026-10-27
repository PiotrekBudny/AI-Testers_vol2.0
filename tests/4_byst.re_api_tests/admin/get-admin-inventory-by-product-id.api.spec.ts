import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectApiError } from "../support/shared/bystre-api.assertions";

test.describe(
  "GET /api/v1/admin/inventory/{productId}",
  { tag: ["@bystre", "@rbac", "@bystre-admin"] },
  () => {
    test("returns inventory initialized for an isolated product", async ({
      bystreAdminApi,
      adminAuthorization,
      createProduct,
    }) => {
      // Arrange
      const product = await createProduct({ stockQuantity: 5 });

      // Act
      const response = await bystreAdminApi.getInventoryItem(
        product.id,
        adminAuthorization,
      );

      // Assert
      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({
        productId: product.id,
        name: product.name,
        availableQuantity: 5,
        stockStatus: expect.any(String),
      });
    });

    test("rejects a regular client", async ({
      bystreAdminApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreAdminApi.getInventoryItem(1, authorization);

      // Assert
      await expectApiError(response, 403);
    });
  },
);
