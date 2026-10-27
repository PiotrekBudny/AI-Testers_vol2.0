import { BystreInventoryTestDataGenerator } from "../support/admin/bystre-inventory-test-data.generator";
import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectApiError } from "../support/shared/bystre-api.assertions";

test.describe(
  "POST /api/v1/admin/inventory/{productId}/adjustments",
  { tag: ["@bystre", "@rbac", "@bystre-admin"] },
  () => {
    test("adjusts isolated stock and restores its original quantity", async ({
      bystreAdminApi,
      adminAuthorization,
      createProduct,
    }) => {
      // Arrange
      const product = await createProduct({ stockQuantity: 2 });
      const adjustment = BystreInventoryTestDataGenerator.adjustment();

      // Act
      const added = await bystreAdminApi.adjustInventory(
        product.id,
        adjustment,
        adminAuthorization,
      );
      const restored = await bystreAdminApi.adjustInventory(
        product.id,
        BystreInventoryTestDataGenerator.adjustment({
          delta: -1,
          reason: "API test restore",
        }),
        adminAuthorization,
      );

      // Assert
      expect(added.status()).toBe(201);
      expect(await added.json()).toMatchObject({
        productId: product.id,
        delta: 1,
        type: "ADMIN_ADJUSTMENT",
        requestId: adjustment.requestId,
      });
      expect(restored.status()).toBe(201);
      expect(await restored.json()).toMatchObject({
        productId: product.id,
        delta: -1,
        quantityAfter: 2,
      });
    });

    test("rejects a regular client", async ({
      bystreAdminApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreAdminApi.adjustInventory(
        1,
        BystreInventoryTestDataGenerator.adjustment({
          reason: "Denied role test",
        }),
        authorization,
      );

      // Assert
      await expectApiError(response, 403);
    });
  },
);
