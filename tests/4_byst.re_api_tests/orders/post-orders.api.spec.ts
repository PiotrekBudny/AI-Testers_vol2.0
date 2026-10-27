import { expect, test } from "../support/orders/bystre-orders-api.fixtures";
import { BystreOrdersTestDataGenerator } from "../support/orders/bystre-orders-test-data.generator";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe("POST /api/v1/orders", { tag: ["@bystre", "@orders"] }, () => {
  test("rejects checkout of an empty cart and creates no order", async ({
    bystreOrdersApi,
    authenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;
    const address = BystreOrdersTestDataGenerator.shippingAddress();

    // Act
    const response = await bystreOrdersApi.create(address, authorization);
    const orders = await bystreOrdersApi.getAll({}, authorization);

    // Assert
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ message: "Cart is empty" });
    expect(orders.status()).toBe(200);
    expect(await orders.json()).toMatchObject({
      content: [],
      totalElements: 0,
    });
  });

  test("validates the shipping address before checkout", async ({
    bystreOrdersApi,
    authenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;
    const address = BystreOrdersTestDataGenerator.shippingAddress({
      street: "",
      city: "",
      state: "",
      zipCode: "bad",
      country: "",
    });

    // Act
    const response = await bystreOrdersApi.create(address, authorization);

    // Assert
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      street: expect.any(String),
      city: expect.any(String),
      state: expect.any(String),
      zipCode: expect.any(String),
      country: expect.any(String),
    });
  });

  for (const { name, authorization } of unauthorizedCases) {
    test(`rejects ${name}`, async ({ bystreOrdersApi }) => {
      // Arrange
      const address = BystreOrdersTestDataGenerator.shippingAddress();

      // Act
      const response = await bystreOrdersApi.create(address, authorization);

      // Assert
      expect(response.status()).toBe(401);
      expect(await response.json()).toMatchObject({
        message: expect.any(String),
      });
    });
  }
});
