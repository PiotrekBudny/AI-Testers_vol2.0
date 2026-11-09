import { expect, test } from "../support/orders/bystre-orders-api.fixtures";
import type { OrderDto } from "../support/orders/bystre-orders-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe(
  "GET /api/v1/orders/{id}",
  { tag: ["@bystre", "@orders"] },
  () => {
    test.describe.configure({ timeout: 30_000 });

    test(
      "returns an owned order to its buyer and an administrator, but hides it from another buyer",
      { tag: "@bystre-admin" },
      async ({
        adminAuthorization,
        authenticatedUser,
        secondAuthenticatedUser,
        bystreOrdersApi,
        ownedOrder,
      }) => {
        // Arrange
        const authorization = `Bearer ${authenticatedUser.token}`;
        const otherAuthorization = `Bearer ${secondAuthenticatedUser.token}`;
        const orderId = ownedOrder.order.id;

        // Act
        const ownerResponse = await bystreOrdersApi.get(orderId, authorization);
        const otherResponse = await bystreOrdersApi.get(
          orderId,
          otherAuthorization,
        );
        const adminResponse = await bystreOrdersApi.get(
          orderId,
          adminAuthorization,
        );

        // Assert
        expect(ownerResponse.status()).toBe(200);
        expect((await ownerResponse.json()) as OrderDto).toMatchObject({
          id: orderId,
          username: authenticatedUser.user.username,
          status: "PENDING",
          items: [{ productId: ownedOrder.product.id, quantity: 1 }],
        });
        expect(otherResponse.status()).toBe(404);
        expect(await otherResponse.json()).toMatchObject({
          message: "Order not found",
        });
        expect(adminResponse.status()).toBe(200);
        expect((await adminResponse.json()) as OrderDto).toMatchObject({
          id: orderId,
          username: authenticatedUser.user.username,
        });
      },
    );

    test("returns not found for an unknown order", async ({
      bystreOrdersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOrdersApi.get(999999999, authorization);

      // Assert
      expect(response.status()).toBe(404);
      expect(await response.json()).toMatchObject({
        message: "Order not found",
      });
    });

    test("rejects a malformed order ID", async ({
      bystreOrdersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOrdersApi.get("not-a-number", authorization);

      // Assert
      expect(response.status()).toBe(400);
      expect(await response.json()).toHaveProperty("error", expect.any(String));
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreOrdersApi }) => {
        // Arrange
        const orderId = 999999999;

        // Act
        const response = await bystreOrdersApi.get(orderId, authorization);

        // Assert
        expect(response.status()).toBe(401);
        expect(await response.json()).toMatchObject({
          message: expect.any(String),
        });
      });
    }
  },
);
