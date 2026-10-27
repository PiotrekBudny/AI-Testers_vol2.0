import { expect, test } from "../support/cart/bystre-cart-api.fixtures";
import type { BystreCartResponse } from "../support/cart/bystre-cart-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe("POST /api/v1/cart/items", { tag: ["@bystre", "@cart"] }, () => {
  test("adds and accumulates a catalog item only in the owner's cart", async ({
    bystreCartApi,
    authenticatedUser,
    secondAuthenticatedUser,
    cartProduct,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;
    const otherAuthorization = `Bearer ${secondAuthenticatedUser.token}`;
    const item = { productId: cartProduct.id, quantity: 1 };

    // Act
    const firstResponse = await bystreCartApi.addItem(item, authorization);
    const secondResponse = await bystreCartApi.addItem(item, authorization);
    const otherResponse = await bystreCartApi.get(otherAuthorization);

    // Assert
    expect(firstResponse.status()).toBe(200);
    expect(firstResponse.headers()["content-type"]).toContain(
      "application/json",
    );
    const firstCart = (await firstResponse.json()) as BystreCartResponse;
    expect(firstCart).toMatchObject({
      username: authenticatedUser.user.username,
      items: [{ productId: cartProduct.id, quantity: 1 }],
      totalItems: 1,
    });
    expect(firstCart.totalPrice).toBeCloseTo(cartProduct.price, 2);
    expect(secondResponse.status()).toBe(200);
    const secondCart = (await secondResponse.json()) as BystreCartResponse;
    expect(secondCart.items).toEqual([
      { productId: cartProduct.id, quantity: 2 },
    ]);
    expect(secondCart.totalItems).toBe(2);
    expect(secondCart.totalPrice).toBeCloseTo(cartProduct.price * 2, 2);
    expect(otherResponse.status()).toBe(200);
    expect(await otherResponse.json()).toMatchObject({
      username: secondAuthenticatedUser.user.username,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  });

  test("rejects zero quantity without changing the cart", async ({
    bystreCartApi,
    authenticatedUser,
    cartProduct,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const response = await bystreCartApi.addItem(
      { productId: cartProduct.id, quantity: 0 },
      authorization,
    );
    const cartResponse = await bystreCartApi.get(authorization);

    // Assert
    expect(response.status()).toBe(400);
    expect(await response.json()).toHaveProperty(
      "quantity",
      expect.any(String),
    );
    expect(cartResponse.status()).toBe(200);
    expect(await cartResponse.json()).toMatchObject({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  });

  test("rejects a missing product and excess stock", async ({
    bystreCartApi,
    authenticatedUser,
    cartProduct,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const missing = await bystreCartApi.addItem(
      { productId: 999999999, quantity: 1 },
      authorization,
    );
    const overstock = await bystreCartApi.addItem(
      { productId: cartProduct.id, quantity: cartProduct.stockQuantity + 1 },
      authorization,
    );
    const cartResponse = await bystreCartApi.get(authorization);

    // Assert
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toMatchObject({ message: expect.any(String) });
    expect(overstock.status()).toBe(409);
    expect(await overstock.json()).toMatchObject({
      message: expect.any(String),
    });
    expect(cartResponse.status()).toBe(200);
    expect(await cartResponse.json()).toMatchObject({
      items: [],
      totalItems: 0,
    });
  });

  for (const { name, authorization } of unauthorizedCases) {
    test(`rejects ${name}`, async ({ bystreCartApi }) => {
      // Arrange
      const item = { productId: 999999999, quantity: 1 };

      // Act
      const response = await bystreCartApi.addItem(item, authorization);

      // Assert
      expect(response.status()).toBe(401);
      expect(await response.json()).toMatchObject({
        message: expect.any(String),
      });
    });
  }
});
