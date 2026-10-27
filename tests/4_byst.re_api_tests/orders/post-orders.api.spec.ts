import type { BystreCartResponse } from "../support/cart/bystre-cart-api.models";
import { expect, test } from "../support/orders/bystre-orders-api.fixtures";
import type { OrderDto } from "../support/orders/bystre-orders-api.models";
import { BystreOrdersTestDataGenerator } from "../support/orders/bystre-orders-test-data.generator";
import type { ProductDto } from "../support/products/bystre-products-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe("POST /api/v1/orders", { tag: ["@bystre", "@orders"] }, () => {
  test.describe.configure({ timeout: 30_000 });

  test(
    "checks out an isolated cart, clears it, and deducts stock",
    { tag: "@bystre-admin" },
    async ({
      authenticatedUser,
      bystreCartApi,
      bystreOrdersApi,
      bystreProductsApi,
      createProduct,
      orderCleanup,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const address = BystreOrdersTestDataGenerator.shippingAddress();
      const product = await createProduct({ stockQuantity: 3 });
      orderCleanup(authenticatedUser);
      const added = await bystreCartApi.addItem(
        { productId: product.id, quantity: 2 },
        authorization,
      );

      // Act
      const response = await bystreOrdersApi.create(address, authorization);
      const cartResponse = await bystreCartApi.get(authorization);
      const productResponse = await bystreProductsApi.get(
        product.id,
        authorization,
      );

      // Assert
      expect(added.status()).toBe(200);
      expect(response.status()).toBe(201);
      const order = (await response.json()) as OrderDto;
      expect(order).toMatchObject({
        id: expect.any(Number),
        username: authenticatedUser.user.username,
        status: "PENDING",
        shippingAddress: address,
        items: [
          {
            productId: product.id,
            productName: product.name,
            quantity: 2,
          },
        ],
      });
      expect(order.items[0].unitPrice).toBeCloseTo(product.price, 2);
      expect(order.items[0].totalPrice).toBeCloseTo(product.price * 2, 2);
      expect(order.totalAmount).toBeCloseTo(product.price * 2, 2);
      expect(cartResponse.status()).toBe(200);
      expect((await cartResponse.json()) as BystreCartResponse).toMatchObject({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
      expect(productResponse.status()).toBe(200);
      expect((await productResponse.json()) as ProductDto).toMatchObject({
        id: product.id,
        stockQuantity: 1,
      });
    },
  );

  test(
    "rejects checkout when another order has exhausted the stock",
    { tag: "@bystre-admin" },
    async ({
      authenticatedUser,
      secondAuthenticatedUser,
      bystreCartApi,
      bystreOrdersApi,
      createProduct,
      orderCleanup,
    }) => {
      // Arrange
      const firstAuthorization = `Bearer ${authenticatedUser.token}`;
      const secondAuthorization = `Bearer ${secondAuthenticatedUser.token}`;
      const product = await createProduct({ stockQuantity: 1 });
      orderCleanup(authenticatedUser);
      orderCleanup(secondAuthenticatedUser);
      const item = { productId: product.id, quantity: 1 };
      const firstCart = await bystreCartApi.addItem(item, firstAuthorization);
      const secondCart = await bystreCartApi.addItem(item, secondAuthorization);
      const address = BystreOrdersTestDataGenerator.shippingAddress();

      // Act
      const firstOrder = await bystreOrdersApi.create(
        address,
        firstAuthorization,
      );
      const rejected = await bystreOrdersApi.create(
        address,
        secondAuthorization,
      );
      const remainingCart = await bystreCartApi.get(secondAuthorization);
      const secondOrders = await bystreOrdersApi.getAll(
        {},
        secondAuthorization,
      );

      // Assert
      expect(firstCart.status()).toBe(200);
      expect(secondCart.status()).toBe(200);
      expect(firstOrder.status()).toBe(201);
      expect(rejected.status()).toBe(409);
      expect(await rejected.json()).toMatchObject({
        message: expect.any(String),
      });
      expect(remainingCart.status()).toBe(200);
      expect((await remainingCart.json()) as BystreCartResponse).toMatchObject({
        items: [item],
        totalItems: 1,
      });
      expect(secondOrders.status()).toBe(200);
      expect(await secondOrders.json()).toMatchObject({
        content: [],
        totalElements: 0,
      });
    },
  );

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
