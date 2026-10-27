import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectProduct } from "../support/products/bystre-products-api.helpers";
import { expectApiError } from "../support/shared/bystre-api.assertions";

test.describe(
  "PUT /api/v1/products/{id}",
  { tag: ["@bystre", "@products", "@rbac", "@bystre-admin"] },
  () => {
    test("updates an isolated product as an administrator", async ({
      bystreProductsApi,
      adminAuthorization,
      ownedProduct,
    }) => {
      // Arrange
      const update = { name: `${ownedProduct.name} updated` };

      // Act
      const response = await bystreProductsApi.update(
        ownedProduct.id,
        update,
        adminAuthorization,
      );

      // Assert
      expect(response.status()).toBe(200);
      const product = await response.json();
      expectProduct(product);
      expect(product).toMatchObject({ id: ownedProduct.id, ...update });
    });

    test("rejects a regular client", async ({
      bystreProductsApi,
      authenticatedUser,
      ownedProduct,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreProductsApi.update(
        ownedProduct.id,
        { name: `${ownedProduct.name} denied` },
        authorization,
      );

      // Assert
      await expectApiError(response, 403);
    });
  },
);
