import { BystreProductsApiClient } from "../products/bystre-products-api.client";
import type { ProductDto } from "../products/bystre-products-api.models";
import { requireBystreStatus } from "../users/bystre-user-lifecycle";
import { test as usersTest } from "../users/bystre-users-api.fixtures";
import { BystreCartApiClient } from "./bystre-cart-api.client";

export { expect } from "../users/bystre-users-api.fixtures";

interface BystreCartApiFixtures {
  bystreCartApi: BystreCartApiClient;
  cartProduct: ProductDto;
}

export const test = usersTest.extend<BystreCartApiFixtures>({
  bystreCartApi: async ({ request }, use): Promise<void> => {
    await use(new BystreCartApiClient(request));
  },
  cartProduct: async ({ request, authenticatedUser }, use): Promise<void> => {
    const productsApi = new BystreProductsApiClient(request);
    const response = await requireBystreStatus(
      productsApi.getAll(`Bearer ${authenticatedUser.token}`),
      "available cart product lookup",
      200,
    );
    const products = (await response.json()) as ProductDto[];
    const product = products.find(
      (candidate) => candidate.stockQuantity >= 3 && candidate.price > 0,
    );
    if (!product) {
      throw new Error(
        "Bystre cart coverage needs an available catalog product.",
      );
    }
    await use(product);
  },
});
