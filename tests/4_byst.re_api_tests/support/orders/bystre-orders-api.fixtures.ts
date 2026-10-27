import { test as cartTest } from "../cart/bystre-cart-api.fixtures";
import { BystreOrdersApiClient } from "./bystre-orders-api.client";

export { expect } from "../cart/bystre-cart-api.fixtures";

interface BystreOrdersApiFixtures {
  bystreOrdersApi: BystreOrdersApiClient;
}

export const test = cartTest.extend<BystreOrdersApiFixtures>({
  bystreOrdersApi: async ({ request }, use): Promise<void> => {
    await use(new BystreOrdersApiClient(request));
  },
});
