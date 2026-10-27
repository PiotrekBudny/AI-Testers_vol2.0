import { expect, test } from "../support/orders/bystre-orders-api.fixtures";
import type { OrderPageDto } from "../support/orders/bystre-orders-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe("GET /api/v1/orders", { tag: ["@bystre", "@orders"] }, () => {
  test("returns the new user's empty paginated order list", async ({
    bystreOrdersApi,
    authenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const response = await bystreOrdersApi.getAll(
      { page: 0, size: 2, status: "PENDING" },
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
