import { expect, test } from "../support/products/bystre-products-api.fixtures";
import type { ProductDto } from "../support/products/bystre-products-api.models";
import { BystreProductsTestDataGenerator } from "../support/products/bystre-products-test-data.generator";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe(
  "POST /api/v1/products",
  { tag: ["@bystre", "@products", "@rbac", "@bystre-admin"] },
  () => {
    test("creates a product that can be retrieved by ID", async ({
      bystreProductsApi,
      adminAuthorization,
      productCleanup,
    }) => {
      // Arrange
      const input = BystreProductsTestDataGenerator.productInput();

      // Act
      const response = await bystreProductsApi.create(
        input,
        adminAuthorization,
      );
      const product = (await response.json()) as ProductDto;
      productCleanup(product.id);
      const lookup = await bystreProductsApi.get(
        product.id,
        adminAuthorization,
      );
      const persisted = (await lookup.json()) as ProductDto;

      // Assert
      expect(response.status()).toBe(201);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(product).toMatchObject({
        id: expect.any(Number),
        ...input,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(product.id).toBeGreaterThan(0);
      expect(lookup.status()).toBe(200);
      expect(persisted).toMatchObject({ id: product.id, ...input });
    });

    test("requires the core product fields", async ({
      bystreProductsApi,
      adminAuthorization,
    }) => {
      // Arrange
      const input = {};

      // Act
      const response = await bystreProductsApi.create(
        input,
        adminAuthorization,
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(String),
        stockQuantity: expect.any(String),
        category: expect.any(String),
      });
    });

    test("rejects a negative price", async ({
      bystreProductsApi,
      adminAuthorization,
    }) => {
      // Arrange
      const input = BystreProductsTestDataGenerator.productInput({ price: -1 });

      // Act
      const response = await bystreProductsApi.create(
        input,
        adminAuthorization,
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("price", expect.stringMatching(/\S+/));
    });

    test("rejects a blank product name", async ({
      bystreProductsApi,
      adminAuthorization,
    }) => {
      // Arrange
      const input = BystreProductsTestDataGenerator.productInput({ name: " " });

      // Act
      const response = await bystreProductsApi.create(
        input,
        adminAuthorization,
      );
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("name", expect.stringMatching(/\S+/));
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
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(403);
      expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreProductsApi }) => {
        // Arrange
        const input = BystreProductsTestDataGenerator.productInput();

        // Act
        const response = await bystreProductsApi.create(input, authorization);
        const body = await response.json();

        // Assert
        expect(response.status()).toBe(401);
        expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
      });
    }
  },
);
