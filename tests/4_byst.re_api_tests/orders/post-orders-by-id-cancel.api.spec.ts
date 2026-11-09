import { expect, test } from "../support/orders/bystre-orders-api.fixtures";
import type { OrderDto } from "../support/orders/bystre-orders-api.models";
import type { ProductDto } from "../support/products/bystre-products-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe(
  "POST /api/v1/orders/{id}/cancel",
  { tag: ["@bystre", "@orders"] },
  () => {
    test.describe.configure({ timeout: 30_000 });

    test(
      "lets the buyer cancel a pending order and restores stock once",
      { tag: "@bystre-admin" },
      async ({
        authenticatedUser,
        bystreOrdersApi,
        bystreProductsApi,
        ownedOrder,
      }) => {
        // Arrange
        const authorization = `Bearer ${authenticatedUser.token}`;
        const orderId = ownedOrder.order.id;

        // Act
        const response = await bystreOrdersApi.cancel(orderId, authorization);
        const repeated = await bystreOrdersApi.cancel(orderId, authorization);
        const persisted = await bystreOrdersApi.get(orderId, authorization);
        const productResponse = await bystreProductsApi.get(
          ownedOrder.product.id,
          authorization,
        );

        // Assert
        expect(response.status()).toBe(200);
        expect((await response.json()) as OrderDto).toMatchObject({
          id: orderId,
          status: "CANCELLED",
        });
        expect(repeated.status()).toBe(400);
        expect(await repeated.json()).toMatchObject({
          message: "Order cannot be cancelled in current status",
        });
        expect(persisted.status()).toBe(200);
        expect((await persisted.json()) as OrderDto).toMatchObject({
          id: orderId,
          status: "CANCELLED",
        });
        expect(productResponse.status()).toBe(200);
        expect((await productResponse.json()) as ProductDto).toMatchObject({
          id: ownedOrder.product.id,
          stockQuantity: 3,
        });
      },
    );

    test(
      "forbids cancellation by another buyer without changing the order",
      { tag: "@bystre-admin" },
      async ({
        authenticatedUser,
        secondAuthenticatedUser,
        bystreOrdersApi,
        ownedOrder,
      }) => {
        // Arrange
        const ownerAuthorization = `Bearer ${authenticatedUser.token}`;
        const otherAuthorization = `Bearer ${secondAuthenticatedUser.token}`;

        // Act
        const denied = await bystreOrdersApi.cancel(
          ownedOrder.order.id,
          otherAuthorization,
        );
        const persisted = await bystreOrdersApi.get(
          ownedOrder.order.id,
          ownerAuthorization,
        );

        // Assert
        expect(denied.status()).toBe(403);
        expect(await denied.json()).toMatchObject({
          message: "You cannot cancel someone else's order",
        });
        expect(persisted.status()).toBe(200);
        expect((await persisted.json()) as OrderDto).toMatchObject({
          id: ownedOrder.order.id,
          status: "PENDING",
        });
      },
    );

    test(
      "lets the buyer cancel a paid order",
      { tag: "@bystre-admin" },
      async ({
        adminAuthorization,
        authenticatedUser,
        bystreAdminApi,
        bystreOrdersApi,
        ownedOrder,
      }) => {
        // Arrange
        const authorization = `Bearer ${authenticatedUser.token}`;
        const paid = await bystreAdminApi.updateOrderStatus(
          ownedOrder.order.id,
          "PAID",
          adminAuthorization,
        );

        // Act
        const response = await bystreOrdersApi.cancel(
          ownedOrder.order.id,
          authorization,
        );

        // Assert
        expect(paid.status()).toBe(200);
        expect(response.status()).toBe(200);
        expect((await response.json()) as OrderDto).toMatchObject({
          id: ownedOrder.order.id,
          status: "CANCELLED",
        });
      },
    );

    test(
      "rejects cancellation after the order has shipped",
      { tag: "@bystre-admin" },
      async ({
        adminAuthorization,
        authenticatedUser,
        bystreAdminApi,
        bystreOrdersApi,
        ownedOrder,
      }) => {
        // Arrange
        const authorization = `Bearer ${authenticatedUser.token}`;
        const shipped = await bystreAdminApi.updateOrderStatus(
          ownedOrder.order.id,
          "SHIPPED",
          adminAuthorization,
        );

        // Act
        const response = await bystreOrdersApi.cancel(
          ownedOrder.order.id,
          authorization,
        );
        const persisted = await bystreOrdersApi.get(
          ownedOrder.order.id,
          authorization,
        );

        // Assert
        expect(shipped.status()).toBe(200);
        expect(response.status()).toBe(400);
        expect(await response.json()).toMatchObject({
          message: "Order cannot be cancelled in current status",
        });
        expect(persisted.status()).toBe(200);
        expect((await persisted.json()) as OrderDto).toMatchObject({
          id: ownedOrder.order.id,
          status: "SHIPPED",
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
      const response = await bystreOrdersApi.cancel(999999999, authorization);

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
      const response = await bystreOrdersApi.cancel(
        "not-a-number",
        authorization,
      );

      // Assert
      expect(response.status()).toBe(400);
      expect(await response.json()).toHaveProperty("error", expect.any(String));
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreOrdersApi }) => {
        // Arrange
        const orderId = 999999999;

        // Act
        const response = await bystreOrdersApi.cancel(orderId, authorization);

        // Assert
        expect(response.status()).toBe(401);
        expect(await response.json()).toMatchObject({
          message: expect.any(String),
        });
      });
    }
  },
);
