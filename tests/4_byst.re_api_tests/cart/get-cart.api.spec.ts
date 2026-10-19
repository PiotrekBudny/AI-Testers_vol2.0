import { expect, test } from "../support/cart/bystre-cart-api.fixtures";
import type { BystreCartResponse } from "../support/cart/bystre-cart-api.models";
import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";

test.describe("GET /api/v1/cart", { tag: ["@bystre", "@cart"] }, () => {
  test("returns the authenticated user's cart and calculated totals", async ({
    bystreCartApi,
    authenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const response = await bystreCartApi.get(authorization);

    // Assert
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    const cart = (await response.json()) as BystreCartResponse;
    expect(cart).toMatchObject({
      username: authenticatedUser.user.username,
      items: expect.any(Array),
      totalPrice: expect.any(Number),
      totalItems: expect.any(Number),
    });
    expect(cart.totalPrice).toBeGreaterThanOrEqual(0);
    expect(cart.totalItems).toBe(
      cart.items.reduce((total, item) => total + item.quantity, 0),
    );
    for (const item of cart.items) {
      expect(item.productId).toEqual(expect.any(Number));
      expect(item.quantity).toBeGreaterThan(0);
    }
  });

  for (const { name, authorization } of unauthorizedCases) {
    test("rejects " + name, async ({ bystreCartApi }) => {
      // Arrange
      // Act
      const response = await bystreCartApi.get(authorization);

      // Assert
      await expectApiError(response, 401);
    });
  }
});
