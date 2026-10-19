import { requireBystreStatus } from "../users/bystre-user-lifecycle";
import { expect, test as usersTest } from "../users/bystre-users-api.fixtures";
import type { BystreLoginResponse } from "../users/bystre-users-api.models";
import { BystreProductsApiClient } from "./bystre-products-api.client";
import { productInput } from "./bystre-products-api.helpers";
import type { ProductDto, ProductInput } from "./bystre-products-api.models";

export { expect } from "../users/bystre-users-api.fixtures";
interface ProductsFixtures {
  bystreProductsApi: BystreProductsApiClient;
  adminAuthorization: string;
  createProduct: (overrides?: Partial<ProductInput>) => Promise<ProductDto>;
  productCleanup: (id: number) => void;
  ownedProduct: ProductDto;
}
export const test = usersTest.extend<ProductsFixtures>({
  bystreProductsApi: async ({ request }, use): Promise<void> => {
    await use(new BystreProductsApiClient(request));
  },
  adminAuthorization: async ({ bystreUsersApi }, use): Promise<void> => {
    const username = process.env.BYSTRE_API_ADMIN_USERNAME;
    const password = process.env.BYSTRE_API_ADMIN_PASSWORD;
    // Admin-only cases need an explicitly configured test identity.
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !username && !password,
      "Admin coverage blocked: set BYSTRE_API_ADMIN_USERNAME and BYSTRE_API_ADMIN_PASSWORD.",
    );
    if (!username || !password)
      throw new Error("Configure both Bystre admin credential variables.");
    const response = await requireBystreStatus(
      bystreUsersApi.login({ username, password }),
      "admin sign-in",
      200,
    );
    const body = (await response.json()) as BystreLoginResponse;
    // Do not print the authentication response or compare the token in an assertion.
    if (body.mfaRequired || !body.token)
      throw new Error(
        "Admin fixture requires a non-MFA controlled test identity.",
      );
    const authorization = `Bearer ${body.token}`;
    const me = await requireBystreStatus(
      bystreUsersApi.getMe(authorization),
      "admin role verification",
      200,
    );
    expect((await me.json()).roles).toContain("ROLE_ADMIN");
    await use(authorization);
  },
  productCleanup: async (
    { bystreProductsApi, adminAuthorization },
    use,
  ): Promise<void> => {
    const ids = new Set<number>();
    await use((id) => {
      ids.add(id);
    });
    const failures: string[] = [];
    for (const id of ids) {
      try {
        const response = await bystreProductsApi.delete(id, adminAuthorization);
        // A deletion spec may already have deleted its own product.
        if (![204, 404].includes(response.status()))
          failures.push(`${id}: HTTP ${response.status()}`);
      } catch {
        failures.push(`${id}: cleanup transport failure`);
      }
    }
    if (failures.length)
      throw new Error(`Product cleanup failed: ${failures.join(", ")}`);
  },
  createProduct: async (
    { bystreProductsApi, adminAuthorization, productCleanup },
    use,
  ): Promise<void> => {
    await use(async (overrides = {}) => {
      const response = await requireBystreStatus(
        bystreProductsApi.create(productInput(overrides), adminAuthorization),
        "product creation",
        201,
      );
      const body = (await response.json()) as ProductDto;
      if (!Number.isSafeInteger(body.id) || body.id <= 0)
        throw new Error("Created product has no usable ID for cleanup.");
      productCleanup(body.id);
      return body;
    });
  },
  ownedProduct: async ({ createProduct }, use): Promise<void> => {
    await use(await createProduct());
  },
});
