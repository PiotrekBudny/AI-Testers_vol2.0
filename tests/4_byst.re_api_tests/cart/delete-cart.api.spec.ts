import { expect, test } from "../support/cart/bystre-cart-api.fixtures";
import type { BystreCartResponse } from "../support/cart/bystre-cart-api.models";
import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";

test.describe("DELETE /api/v1/cart", { tag: ["@bystre", "@cart"] }, () => {
  test("clears the authenticated user's cart", async ({
    bystreCartApi,
    authenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const clearResponse = await bystreCartApi.clear(authorization);
    const cartResponse = await bystreCartApi.get(authorization);

    // Assert
    expect(clearResponse.status()).toBe(204);
    expect(await clearResponse.text()).toBe("");
    expect(cartResponse.status()).toBe(200);
    const cart = (await cartResponse.json()) as BystreCartResponse;
    expect(cart).toMatchObject({
      username: authenticatedUser.user.username,
      items: [],
      totalPrice: 0,
      totalItems: 0,
    });
  });

  for (const { name, authorization } of unauthorizedCases) {
    test("rejects " + name, async ({ bystreCartApi }) => {
      // Arrange
      // Act
      const response = await bystreCartApi.clear(authorization);

      // Assert
      await expectApiError(response, 401);
    });
  }
});
