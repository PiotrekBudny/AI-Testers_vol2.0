import { test as usersTest } from "../users/bystre-users-api.fixtures";
import { BystreCartApiClient } from "./bystre-cart-api.client";

export { expect } from "../users/bystre-users-api.fixtures";

interface BystreCartApiFixtures {
  bystreCartApi: BystreCartApiClient;
}

export const test = usersTest.extend<BystreCartApiFixtures>({
  bystreCartApi: async ({ request }, use): Promise<void> => {
    await use(new BystreCartApiClient(request));
  },
});
