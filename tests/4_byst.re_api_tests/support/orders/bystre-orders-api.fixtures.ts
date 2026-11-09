import { BystreCartApiClient } from "../cart/bystre-cart-api.client";
import { test as productsTest } from "../products/bystre-products-api.fixtures";
import type { ProductDto } from "../products/bystre-products-api.models";
import { requireBystreStatus } from "../users/bystre-user-lifecycle";
import type { BystreAuthenticatedUser } from "../users/bystre-users-api.models";
import { BystreOrdersApiClient } from "./bystre-orders-api.client";
import type { OrderDto } from "./bystre-orders-api.models";
import { BystreOrdersTestDataGenerator } from "./bystre-orders-test-data.generator";

export { expect } from "../products/bystre-products-api.fixtures";

interface BystreOrdersApiFixtures {
  bystreCartApi: BystreCartApiClient;
  bystreOrdersApi: BystreOrdersApiClient;
  orderCleanup: (user: BystreAuthenticatedUser) => void;
  ownedOrder: { order: OrderDto; product: ProductDto };
}

export const test = productsTest.extend<BystreOrdersApiFixtures>({
  bystreCartApi: async ({ request }, use): Promise<void> => {
    await use(new BystreCartApiClient(request));
  },
  bystreOrdersApi: async ({ request }, use): Promise<void> => {
    await use(new BystreOrdersApiClient(request));
  },
  orderCleanup: async (
    { bystreUsersApi, productCleanup, userCleanup },
    use,
  ): Promise<void> => {
    void productCleanup;
    const users = new Map<string, BystreAuthenticatedUser>();
    await use((user) => {
      users.set(user.user.username, user);
    });
    const failures: string[] = [];
    for (const { user, token } of users.values()) {
      try {
        await requireBystreStatus(
          bystreUsersApi.deleteOwnAccount(user.username, `Bearer ${token}`),
          "order customer cleanup",
          204,
        );
        userCleanup(user, token, true);
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "Cleanup failed.";
        failures.push(`Account ${user.username}: ${reason}`);
      }
    }
    if (failures.length)
      throw new Error(
        `Bystre order customer cleanup failed:\n${failures.join("\n")}`,
      );
  },
  ownedOrder: async (
    {
      authenticatedUser,
      bystreCartApi,
      bystreOrdersApi,
      createProduct,
      orderCleanup,
    },
    use,
  ): Promise<void> => {
    const authorization = `Bearer ${authenticatedUser.token}`;
    orderCleanup(authenticatedUser);
    const product = await createProduct({ stockQuantity: 3 });
    await requireBystreStatus(
      bystreCartApi.addItem(
        { productId: product.id, quantity: 1 },
        authorization,
      ),
      "order fixture cart setup",
      200,
    );
    const response = await requireBystreStatus(
      bystreOrdersApi.create(
        BystreOrdersTestDataGenerator.shippingAddress(),
        authorization,
      ),
      "order fixture checkout",
      201,
    );
    await use({ order: (await response.json()) as OrderDto, product });
  },
});
