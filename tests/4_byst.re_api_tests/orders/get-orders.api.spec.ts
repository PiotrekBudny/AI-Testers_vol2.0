import { expect, test } from "../support/orders/bystre-orders-api.fixtures";
import type { OrderPageDto } from "../support/orders/bystre-orders-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe("GET /api/v1/orders", { tag: ["@bystre", "@orders"] }, () => {
  test.describe.configure({ timeout: 30_000 });

  test(
    "lists only the owner's order and filters by its status",
    { tag: "@bystre-admin" },
    async ({
      authenticatedUser,
      secondAuthenticatedUser,
      bystreOrdersApi,
      ownedOrder,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const otherAuthorization = `Bearer ${secondAuthenticatedUser.token}`;

      // Act
      const allResponse = await bystreOrdersApi.getAll(
        { page: 0, size: 1 },
        authorization,
      );
      const pendingResponse = await bystreOrdersApi.getAll(
        { status: "PENDING" },
        authorization,
      );
      const paidResponse = await bystreOrdersApi.getAll(
        { status: "PAID" },
        authorization,
      );
      const otherResponse = await bystreOrdersApi.getAll(
        {},
        otherAuthorization,
      );

      // Assert
      expect(allResponse.status()).toBe(200);
      expect((await allResponse.json()) as OrderPageDto).toMatchObject({
        content: [{ id: ownedOrder.order.id, status: "PENDING" }],
        pageNumber: 0,
        pageSize: 1,
        totalElements: 1,
        totalPages: 1,
      });
      expect(pendingResponse.status()).toBe(200);
      expect((await pendingResponse.json()) as OrderPageDto).toMatchObject({
        content: [{ id: ownedOrder.order.id }],
        totalElements: 1,
      });
      expect(paidResponse.status()).toBe(200);
      expect((await paidResponse.json()) as OrderPageDto).toMatchObject({
        content: [],
        totalElements: 0,
      });
      expect(otherResponse.status()).toBe(200);
      expect((await otherResponse.json()) as OrderPageDto).toMatchObject({
        content: [],
        totalElements: 0,
      });
    },
  );

  test("returns the new user's empty paginated order list without a status filter", async ({
    bystreOrdersApi,
    authenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const response = await bystreOrdersApi.getAll(
      { page: 0, size: 2 },
      authorization,
    );

    // Assert
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    const page = (await response.json()) as OrderPageDto;
    expect(page).toMatchObject({
      content: [],
      pageNumber: 0,
      pageSize: 2,
      totalElements: 0,
      totalPages: 0,
    });
  });

  for (const query of [{ page: -1 }, { size: 0 }, { status: "INVALID" }]) {
    test(`rejects invalid query ${JSON.stringify(query)}`, async ({
      bystreOrdersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOrdersApi.getAll(query, authorization);

      // Assert
      expect(response.status()).toBe(400);
      expect(await response.json()).toHaveProperty("error", expect.any(String));
    });
  }

  for (const { name, authorization } of unauthorizedCases) {
    test(`rejects ${name}`, async ({ bystreOrdersApi }) => {
      // Arrange
      const query = { page: 0, size: 2 };

      // Act
      const response = await bystreOrdersApi.getAll(query, authorization);

      // Assert
      expect(response.status()).toBe(401);
      expect(await response.json()).toMatchObject({
        message: expect.any(String),
      });
    });
  }
});
