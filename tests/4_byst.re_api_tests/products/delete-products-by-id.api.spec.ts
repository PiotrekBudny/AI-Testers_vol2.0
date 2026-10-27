import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectApiError } from "../support/shared/bystre-api.assertions";

test.describe(
  "DELETE /api/v1/products/{id}",
  { tag: ["@bystre", "@products", "@rbac", "@bystre-admin"] },
  () => {
    test("deletes an isolated product as an administrator", async ({
      bystreProductsApi,
      adminAuthorization,
      createProduct,
    }) => {
      // Arrange
      const product = await createProduct({ stockQuantity: 0 });

      // Act
      const response = await bystreProductsApi.delete(
        product.id,
        adminAuthorization,
      );

      // Assert
      expect(response.status()).toBe(204);
    });

    test("rejects a regular client", async ({
      bystreProductsApi,
      authenticatedUser,
      ownedProduct,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreProductsApi.delete(
        ownedProduct.id,
        authorization,
      );

      // Assert
      await expectApiError(response, 403);
    });
  },
);
