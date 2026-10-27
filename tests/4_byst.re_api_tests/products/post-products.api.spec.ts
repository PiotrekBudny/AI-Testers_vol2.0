import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectProduct } from "../support/products/bystre-products-api.helpers";
import { BystreProductsTestDataGenerator } from "../support/products/bystre-products-test-data.generator";
import { expectApiError } from "../support/shared/bystre-api.assertions";

test.describe(
  "POST /api/v1/products",
  { tag: ["@bystre", "@products", "@rbac", "@bystre-admin"] },
  () => {
    test("creates an isolated product as an administrator", async ({
      createProduct,
    }) => {
      // Arrange
      const input = BystreProductsTestDataGenerator.productInput();

      // Act
      const product = await createProduct(input);

      // Assert
      expectProduct(product);
      expect(product).toMatchObject({ ...input });
    });

    test("rejects a regular client", async ({
      bystreProductsApi,
      authenticatedUser,
    }) => {
      // Arrange
      const input = BystreProductsTestDataGenerator.productInput();
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreProductsApi.create(input, authorization);

      // Assert
      await expectApiError(response, 403);
    });
  },
);
