import { expect, test } from "../support/cart/bystre-cart-api.fixtures";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";
import { requireBystreStatus } from "../support/users/bystre-user-lifecycle";

test.describe(
  "DELETE /api/v1/cart/items/{productId}",
  { tag: ["@bystre", "@cart"] },
  () => {
    test("removes only the owner's item and persists an empty cart", async ({
      bystreCartApi,
      authenticatedUser,
      secondAuthenticatedUser,
      cartProduct,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const otherAuthorization = `Bearer ${secondAuthenticatedUser.token}`;
      await requireBystreStatus(
        bystreCartApi.addItem(
          { productId: cartProduct.id, quantity: 1 },
          authorization,
        ),
        "cart item setup",
        200,
      );
      await requireBystreStatus(
        bystreCartApi.addItem(
          { productId: cartProduct.id, quantity: 1 },
          otherAuthorization,
        ),
        "second user's cart item setup",
        200,
      );

      // Act
      const response = await bystreCartApi.removeItem(
        cartProduct.id,
        authorization,
      );
      const persisted = await bystreCartApi.get(authorization);
      const otherCart = await bystreCartApi.get(otherAuthorization);

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(await response.json()).toMatchObject({
        username: authenticatedUser.user.username,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
      expect(persisted.status()).toBe(200);
      expect(await persisted.json()).toMatchObject({
        items: [],
        totalItems: 0,
      });
      expect(otherCart.status()).toBe(200);
      expect(await otherCart.json()).toMatchObject({
        username: secondAuthenticatedUser.user.username,
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
      const response = await bystreCartApi.removeItem(
        cartProduct.id,
        authorization,
      );

      // Assert
      expect(response.status()).toBe(404);
      expect(await response.json()).toMatchObject({
        message: expect.any(String),
      });
    });

    test("rejects a malformed product ID", async ({
      bystreCartApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreCartApi.removeItem(
        "not-a-number",
        authorization,
      );

      // Assert
      expect(response.status()).toBe(400);
      expect(await response.json()).toHaveProperty("error", expect.any(String));
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreCartApi }) => {
        // Arrange
        const productId = 999999999;

        // Act
        const response = await bystreCartApi.removeItem(
          productId,
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
