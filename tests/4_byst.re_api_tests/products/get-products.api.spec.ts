import { expect, test } from "../support/products/bystre-products-api.fixtures";
import { expectProduct } from "../support/products/bystre-products-api.helpers";
import type { ProductDto } from "../support/products/bystre-products-api.models";
import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";

test.describe("GET /api/v1/products", { tag: ["@bystre", "@products"] }, () => {
  test("returns the catalog with unique IDs and valid product data", async ({
    bystreProductsApi,
    authenticatedUser,
  }) => {
    const response = await bystreProductsApi.getAll(
      "Bearer " + authenticatedUser.token,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    const products = (await response.json()) as ProductDto[];
    expect(Array.isArray(products)).toBe(true);
    for (const product of products) expectProduct(product);
    expect(new Set(products.map((product) => product.id)).size).toBe(
      products.length,
    );
  });

  for (const { name, authorization } of unauthorizedCases) {
    test("rejects " + name, async ({ bystreProductsApi }) => {
      await expectApiError(await bystreProductsApi.getAll(authorization), 401);
    });
  }
});
