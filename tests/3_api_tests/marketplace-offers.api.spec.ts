import { expect, test } from "@playwright/test";

import type { ApiSuccessResponse } from "../../src/api/types/common";
import type {
  MarketplaceOfferCreateResponseData,
  MarketplaceOffersListResponseData,
} from "../../src/api/types/marketplace";
import { ApiUrls } from "../../src/api/urls";
import {
  createFieldForUser,
  createFundedUser,
  readApiResponse,
  registerFreshUser,
} from "./api-test-helpers";

test.describe("Marketplace Operations", () => {
  test(
    "POST /marketplace/offers creates a field offer",
    { tag: ["@marketplace", "@smoke"] },
    async ({ request }) => {
      // Arrange
      const { token, userId } = await createFundedUser(request, 50.0);
      const fieldId = await createFieldForUser(request, token);

      // Act
      const response = await request.post(ApiUrls.marketplaceOffers, {
        headers: { token },
        data: {
          itemType: "field",
          itemId: fieldId,
          price: 25.0,
          description: "Test field for sale",
        },
      });
      const body =
        await readApiResponse<
          ApiSuccessResponse<MarketplaceOfferCreateResponseData>
        >(response);

      // Assert
      expect(
        response.status(),
        "Marketplace offer creation should return HTTP 200",
      ).toBe(200);
      expect(
        body.success,
        "Marketplace offer creation should return success: true",
      ).toBe(true);
      expect(body.data.offer).toHaveProperty("id");
      expect(body.data.offer.sellerId).toBe(userId);
      expect(body.data.offer.itemType).toBe("field");
      expect(body.data.offer.itemId).toBe(fieldId);
      expect(body.data.offer.price).toBe(25.0);
      expect(body.data.offer.description).toBe("Test field for sale");
      expect(body.data.offer.status).toBe("active");
    },
  );

  test(
    "POST /marketplace/offers creates an animal offer",
    { tag: ["@marketplace"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();
      const animalId = 99999;

      // Act
      const response = await request.post(ApiUrls.marketplaceOffers, {
        headers: { token },
        data: {
          itemType: "animal",
          itemId: animalId,
          price: 15.0,
          description: "Test animal for sale",
        },
      });

      // Assert
      expect(
        response.status(),
        "Offer creation for non-owned item should return HTTP 404",
      ).toBe(404);
    },
  );

  test(
    "GET /marketplace/offers returns active offers",
    { tag: ["@marketplace"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();

      // Act
      const response = await request.get(ApiUrls.marketplaceOffers, {
        headers: { token },
      });
      const body =
        await readApiResponse<
          ApiSuccessResponse<MarketplaceOffersListResponseData>
        >(response);

      // Assert
      expect(
        response.status(),
        "Marketplace offers retrieval should return HTTP 200",
      ).toBe(200);
      expect(
        body.success,
        "Marketplace offers retrieval should return success: true",
      ).toBe(true);
      expect(body.data.offers).toBeInstanceOf(Array);
      expect(body.data.total).toBeGreaterThanOrEqual(0);
    },
  );

  test(
    "GET /marketplace/my-offers returns user's own offers",
    { tag: ["@marketplace"] },
    async ({ request }) => {
      // Arrange
      const { token, userId } = await createFundedUser(request, 30.0);
      const fieldId = await createFieldForUser(request, token);

      await request.post(ApiUrls.marketplaceOffers, {
        headers: { token },
        data: {
          itemType: "field",
          itemId: fieldId,
          price: 10.0,
          description: "Test offer",
        },
      });

      // Act
      const response = await request.get(ApiUrls.marketplaceMyOffers, {
        headers: { token },
      });
      const body =
        await readApiResponse<
          ApiSuccessResponse<MarketplaceOffersListResponseData>
        >(response);

      // Assert
      expect(
        response.status(),
        "User's marketplace offers retrieval should return HTTP 200",
      ).toBe(200);
      expect(
        body.success,
        "User's marketplace offers retrieval should return success: true",
      ).toBe(true);
      expect(body.data.offers).toBeInstanceOf(Array);
      expect(body.data.offers.map((offer) => offer.sellerId)).toContain(userId);
    },
  );

  test(
    "DELETE /marketplace/offers/{id} cancels an active offer",
    { tag: ["@marketplace"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();
      const fieldId = await createFieldForUser(request, token);

      const createResponse = await request.post(ApiUrls.marketplaceOffers, {
        headers: { token },
        data: {
          itemType: "field",
          itemId: fieldId,
          price: 5.0,
          description: "Test offer to cancel",
        },
      });
      const createBody =
        await readApiResponse<
          ApiSuccessResponse<MarketplaceOfferCreateResponseData>
        >(createResponse);
      const offerId = createBody.data.offer.id;

      // Act
      const response = await request.delete(
        ApiUrls.marketplaceOfferById(offerId),
        { headers: { token } },
      );
      const body = await readApiResponse<ApiSuccessResponse>(response);

      // Assert
      expect(
        response.status(),
        "Offer cancellation should return HTTP 200",
      ).toBe(200);
      expect(
        body.success,
        "Offer cancellation should return success: true",
      ).toBe(true);
    },
  );

  test(
    "DELETE /marketplace/offers/{id} with invalid ID returns 404",
    { tag: ["@marketplace"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();
      const invalidOfferId = 99999;

      // Act
      const response = await request.delete(
        ApiUrls.marketplaceOfferById(invalidOfferId),
        { headers: { token } },
      );

      // Assert
      expect(
        response.status(),
        "Deletion of non-existent offer should return HTTP 404",
      ).toBe(404);
    },
  );
});
