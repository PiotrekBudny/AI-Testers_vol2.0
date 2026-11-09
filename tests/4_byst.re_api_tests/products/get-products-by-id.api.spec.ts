import { expect, test } from "../support/products/bystre-products-api.fixtures";
import {
  expectProduct,
  missingProductId,
} from "../support/products/bystre-products-api.helpers";
import type { ProductDto } from "../support/products/bystre-products-api.models";
import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";

test.describe(
  "GET /api/v1/products/{id}",
  { tag: ["@bystre", "@products"] },
  () => {
    test("retrieves a catalog product by the ID returned by the list", async ({
      bystreProductsApi,
      authenticatedUser,
    }) => {
      const authorization = "Bearer " + authenticatedUser.token;
      const list = await bystreProductsApi.getAll(authorization);
      expect(list.status()).toBe(200);
      const products = (await list.json()) as ProductDto[];
      // This endpoint cannot provide a successful lookup without catalog data.
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(
        products.length === 0,
        "Catalog is empty; controlled admin data is needed for a successful lookup.",
      );
      const response = await bystreProductsApi.get(
        products[0].id,
        authorization,
      );
      expect(response.status()).toBe(200);
      const body = (await response.json()) as ProductDto;
      expectProduct(body);
      expect(body.id).toBe(products[0].id);
      expect(body.name).toBe(products[0].name);
    });

    test("reports a missing product", async ({
      bystreProductsApi,
      authenticatedUser,
    }) => {
      await expectApiError(
        await bystreProductsApi.get(
          missingProductId,
          "Bearer " + authenticatedUser.token,
        ),
        404,
      );
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreProductsApi }) => {
        await expectApiError(
          await bystreProductsApi.get(missingProductId, authorization),
          401,
        );
      });
    }
  },
);
