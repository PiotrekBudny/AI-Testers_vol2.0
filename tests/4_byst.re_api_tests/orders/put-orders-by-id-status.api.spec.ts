import { BystreOrdersTestDataGenerator } from "../support/orders/bystre-orders-test-data.generator";
import { expect, test } from "../support/products/bystre-products-api.fixtures";
import {
  requireBystreStatus,
  signInBystreUser,
} from "../support/users/bystre-user-lifecycle";
import { BystreTestDataGenerator } from "../support/users/bystre-users-test-data.generator";

test.describe(
  "PUT /api/v1/orders/{id}/status",
  { tag: ["@bystre", "@rbac", "@bystre-admin"] },
  () => {
    test("updates an isolated order status and permits cancellation", async ({
      bystreAdminApi,
      bystreUsersApi,
      adminAuthorization,
      createProduct,
      userCleanup,
    }) => {
      // Arrange
      const user = Object.freeze(BystreTestDataGenerator.signupRequest());
      await requireBystreStatus(
        bystreUsersApi.signup(user),
        "order status test user signup",
        201,
      );
      userCleanup(user);
      const clientAuthorization = `Bearer ${await signInBystreUser(bystreUsersApi, user)}`;
      userCleanup(user, clientAuthorization.slice("Bearer ".length));
      const product = await createProduct({ stockQuantity: 2 });
      await requireBystreStatus(
        bystreAdminApi.addCartItem(product.id, 1, clientAuthorization),
        "order status test cart setup",
        200,
      );
      const orderResponse = await requireBystreStatus(
        bystreAdminApi.createOrder(
          BystreOrdersTestDataGenerator.shippingAddress(),
          clientAuthorization,
        ),
        "order status test order setup",
        201,
      );
      const orderId = ((await orderResponse.json()) as { id: number }).id;
      // Act
      const denied = await bystreAdminApi.updateOrderStatus(
        orderId,
        "SHIPPED",
        clientAuthorization,
      );
      const updated = await bystreAdminApi.updateOrderStatus(
        orderId,
        "PAID",
        adminAuthorization,
      );
      const cancelled = await bystreAdminApi.updateOrderStatus(
        orderId,
        "CANCELLED",
        adminAuthorization,
      );

      // Assert
      expect(denied.status()).toBe(403);
      expect(updated.status()).toBe(200);
      expect(await updated.json()).toMatchObject({
        id: orderId,
        status: "PAID",
      });
      expect(cancelled.status()).toBe(200);
      expect(await cancelled.json()).toMatchObject({
        id: orderId,
        status: "CANCELLED",
      });
      const deleteUser = await bystreUsersApi.deleteByUsername(
        user.username,
        adminAuthorization,
      );
      expect(deleteUser.status()).toBe(204);
      userCleanup(user, clientAuthorization.slice("Bearer ".length), true);
    });
  },
);
