import { expect, test } from "../support/cart/bystre-cart-api.fixtures";
import type { BystreCartResponse } from "../support/cart/bystre-cart-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";
import { requireBystreStatus } from "../support/users/bystre-user-lifecycle";

test.describe(
  "PUT /api/v1/cart/items/{productId}",
  { tag: ["@bystre", "@cart"] },
  () => {
    test("sets quantity and updates persisted totals", async ({
      bystreCartApi,
      authenticatedUser,
      cartProduct,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      await requireBystreStatus(
        bystreCartApi.addItem(
          { productId: cartProduct.id, quantity: 1 },
          authorization,
        ),
        "cart item setup",
        200,
      );

      // Act
      const response = await bystreCartApi.updateItem(
        cartProduct.id,
        { quantity: 2 },
        authorization,
      );
      const persisted = await bystreCartApi.get(authorization);

      // Assert
      expect(response.status()).toBe(200);
      const cart = (await response.json()) as BystreCartResponse;
      expect(cart).toMatchObject({
        username: authenticatedUser.user.username,
        items: [{ productId: cartProduct.id, quantity: 2 }],
        totalItems: 2,
      });
      expect(cart.totalPrice).toBeCloseTo(cartProduct.price * 2, 2);
      expect(persisted.status()).toBe(200);
      expect(await persisted.json()).toEqual(cart);
    });

    test("quantity zero removes an existing item", async ({
      bystreCartApi,
      authenticatedUser,
      cartProduct,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      await requireBystreStatus(
        bystreCartApi.addItem(
          { productId: cartProduct.id, quantity: 1 },
          authorization,
        ),
        "cart item setup",
        200,
      );

      // Act
      const response = await bystreCartApi.updateItem(
        cartProduct.id,
        { quantity: 0 },
        authorization,
      );
      const persisted = await bystreCartApi.get(authorization);

      // Assert
      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
      expect(persisted.status()).toBe(200);
      expect(await persisted.json()).toMatchObject({
        items: [],
        totalItems: 0,
      });
    });

    test("rejects invalid quantity and stock overflow without changing the item", async ({
      bystreCartApi,
      authenticatedUser,
      cartProduct,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      await requireBystreStatus(
        bystreCartApi.addItem(
          { productId: cartProduct.id, quantity: 1 },
          authorization,
        ),
        "cart item setup",
        200,
      );

      // Act
      const invalid = await bystreCartApi.updateItem(
        cartProduct.id,
        { quantity: -1 },
        authorization,
      );
      const overstock = await bystreCartApi.updateItem(
        cartProduct.id,
        { quantity: cartProduct.stockQuantity + 1 },
        authorization,
      );
      const persisted = await bystreCartApi.get(authorization);

      // Assert
      expect(invalid.status()).toBe(400);
      expect(await invalid.json()).toHaveProperty(
        "quantity",
        expect.any(String),
      );
      expect(overstock.status()).toBe(409);
      expect(await overstock.json()).toMatchObject({
        message: expect.any(String),
      });
      expect(persisted.status()).toBe(200);
      expect(await persisted.json()).toMatchObject({
        items: [{ productId: cartProduct.id, quantity: 1 }],
        totalItems: 1,
      });
    });

    test("rejects an item absent from the user's cart", async ({
      bystreCartApi,
      authenticatedUser,
      cartProduct,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreCartApi.updateItem(
        cartProduct.id,
        { quantity: 1 },
        authorization,
      );

      // Assert
      expect(response.status()).toBe(404);
      expect(await response.json()).toMatchObject({
        message: expect.any(String),
      });
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreCartApi }) => {
        // Arrange
        const productId = 999999999;

        // Act
        const response = await bystreCartApi.updateItem(
          productId,
          { quantity: 1 },
          authorization,
        );

        // Assert
        expect(response.status()).toBe(401);
        expect(await response.json()).toMatchObject({
          message: expect.any(String),
        });
      });
    }
  },
);
