import { BystreInventoryTestDataGenerator } from "../support/admin/bystre-inventory-test-data.generator";
import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectApiError } from "../support/shared/bystre-api.assertions";

test.describe(
  "GET /api/v1/admin/inventory/{productId}/movements",
  { tag: ["@bystre", "@rbac", "@bystre-admin"] },
  () => {
    test("returns the created adjustment in movement history", async ({
      bystreAdminApi,
      adminAuthorization,
      createProduct,
    }) => {
      // Arrange
      const product = await createProduct({ stockQuantity: 0 });
      const adjustment = BystreInventoryTestDataGenerator.adjustment({
        reason: "Movement history test",
      });
      const restored = await bystreAdminApi.adjustInventory(
        product.id,
        adjustment,
        adminAuthorization,
      );
      await bystreAdminApi.adjustInventory(
        product.id,
        BystreInventoryTestDataGenerator.adjustment({
          delta: -1,
          reason: "Movement history restore",
        }),
        adminAuthorization,
      );

      // Act
      const response = await bystreAdminApi.getInventoryMovements(
        product.id,
        adminAuthorization,
      );
      const inventory = await bystreAdminApi.getInventoryItem(
        product.id,
        adminAuthorization,
      );

      // Assert
      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({
        content: expect.arrayContaining([
          expect.objectContaining({
            productId: product.id,
            delta: 1,
            type: "ADMIN_ADJUSTMENT",
            requestId: adjustment.requestId,
          }),
        ]),
      });
      expect(restored.status()).toBe(201);
      expect(await inventory.json()).toMatchObject({
        productId: product.id,
        availableQuantity: 0,
      });
    });

    test("rejects a regular client", async ({
      bystreAdminApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreAdminApi.getInventoryMovements(
        1,
        authorization,
      );

      // Assert
      await expectApiError(response, 403);
    });
  },
);
