import { expect, test } from "../support/orders/bystre-orders-api.fixtures";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe(
  "GET /api/v1/orders/{id}",
  { tag: ["@bystre", "@orders"] },
  () => {
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
