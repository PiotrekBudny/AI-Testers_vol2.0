import { expect, test } from "@playwright/test";

import type { ApiSuccessResponse } from "../../src/api/types/common";
import type {
  ContactResponseBody,
  FeatureFlagsData,
  FeatureFlagsWithDescriptionsData,
} from "../../src/api/types/flagged";
import { ApiUrls } from "../../src/api/urls";
import { readApiResponse } from "./api-test-helpers";

test(
  "contact form submission status matches the current contactFormEnabled flag",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Arrange
    const flagsResponse = await request.get(ApiUrls.featureFlags);
    const flagsBody =
      await readApiResponse<ApiSuccessResponse<FeatureFlagsData>>(
        flagsResponse,
      );
    const isContactFormEnabled = flagsBody.data.flags.contactFormEnabled;
    const payload = {
      name: "QA Tester",
      email: "qa.tester@example.com",
      subject: "Test subject",
      message: "Test message body",
    };

    // Act
    const response = await request.post(ApiUrls.contact, { data: payload });
    const body = await readApiResponse<ContactResponseBody>(response);

    // Assert
    const expectedStatus = [404, 200][Number(isContactFormEnabled)];
    expect(
      response.status(),
      `contactFormEnabled=${String(isContactFormEnabled)} should return HTTP ${expectedStatus}`,
    ).toBe(expectedStatus);
    expect(
      body.success,
      "Response success flag should match the contact form status code",
    ).toBe(isContactFormEnabled);
  },
);

test(
  "contact form submission fails with missing required fields",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Arrange
    const emptyPayload = {};

    // Act
    const response = await request.post(ApiUrls.contact, {
      data: emptyPayload,
    });
    const body = await readApiResponse<ContactResponseBody>(response);

    // Assert
    expect(
      response.status(),
      "Missing required contact fields should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Invalid contact submission should return success: false",
    ).toBe(false);
  },
);

test(
  "GET /alerts returns 200 without a token",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.alerts);
    const body =
      await readApiResponse<ApiSuccessResponse<Record<string, unknown>>>(
        response,
      );

    // Assert
    expect(
      response.status(),
      "Public alerts endpoint should return HTTP 200 without a token",
    ).toBe(200);
    expect(
      body.success,
      "Public alerts request should return success: true",
    ).toBe(true);
  },
);

test(
  "GET /alerts/history returns 200 without a token and accepts date/region params",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Arrange
    const params = { date: "2026-09-01", region: "PL-MZ" };

    // Act
    const response = await request.get(ApiUrls.alertsHistory, { params });
    const body =
      await readApiResponse<ApiSuccessResponse<Record<string, unknown>>>(
        response,
      );

    // Assert
    expect(
      response.status(),
      "Public alerts history endpoint should return HTTP 200 with date/region params",
    ).toBe(200);
    expect(
      body.success,
      "Alerts history request with date/region params should return success: true",
    ).toBe(true);
  },
);

test(
  "GET /alerts/upcoming returns 200 without a token",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.alertsUpcoming);
    const body =
      await readApiResponse<ApiSuccessResponse<Record<string, unknown>>>(
        response,
      );

    // Assert
    expect(
      response.status(),
      "Public alerts upcoming endpoint should return HTTP 200 without a token",
    ).toBe(200);
    expect(
      body.success,
      "Public alerts upcoming request should return success: true",
    ).toBe(true);
  },
);

test(
  "GET /feature-flags returns 200 with a flags map",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.featureFlags);
    const body =
      await readApiResponse<ApiSuccessResponse<FeatureFlagsData>>(response);

    // Assert
    expect(response.status(), "Feature flags should return HTTP 200").toBe(200);
    expect(
      body.data.flags,
      "Feature flags response should include a flags map",
    ).toEqual(expect.any(Object));
  },
);

test(
  "GET /feature-flags with descriptions=true includes description objects",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.featureFlags, {
      params: { descriptions: "true" },
    });
    const body =
      await readApiResponse<
        ApiSuccessResponse<FeatureFlagsWithDescriptionsData>
      >(response);
    const [firstFlagKey] = Object.keys(body.data.flags);

    // Assert
    expect(response.status(), "descriptions=true should return HTTP 200").toBe(
      200,
    );
    expect(
      body.data.flags[firstFlagKey],
      "Each flag should include a description object when descriptions=true",
    ).toHaveProperty("description");
  },
);

test(
  "GET /feature-flags with descriptions=false excludes description objects",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.featureFlags, {
      params: { descriptions: "false" },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<FeatureFlagsData>>(response);
    const [firstFlagKey] = Object.keys(body.data.flags);

    // Assert
    expect(response.status(), "descriptions=false should return HTTP 200").toBe(
      200,
    );
    expect(
      typeof body.data.flags[firstFlagKey],
      "Flags should be plain booleans when descriptions=false",
    ).toBe("boolean");
  },
);

test(
  "PATCH /feature-flags fails when a flag value is not boolean",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Arrange
    const invalidPayload = { flags: { contactFormEnabled: "yes" } };

    // Act
    const response = await request.patch(ApiUrls.featureFlags, {
      data: invalidPayload,
    });
    const body = await readApiResponse<ContactResponseBody>(response);

    // Assert
    expect(
      response.status(),
      "Non-boolean flag value should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Invalid flag value should return success: false",
    ).toBe(false);
  },
);

test(
  "PATCH /feature-flags fails when the flags field is missing",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Arrange
    const emptyPayload = {};

    // Act
    const response = await request.patch(ApiUrls.featureFlags, {
      data: emptyPayload,
    });
    const body = await readApiResponse<ContactResponseBody>(response);

    // Assert
    expect(
      response.status(),
      "Missing flags field should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Missing flags field should return success: false",
    ).toBe(false);
  },
);

test(
  "PUT /feature-flags fails when a flag value is not boolean",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Arrange
    const invalidPayload = { flags: { contactFormEnabled: "yes" } };

    // Act
    const response = await request.put(ApiUrls.featureFlags, {
      data: invalidPayload,
    });
    const body = await readApiResponse<ContactResponseBody>(response);

    // Assert
    expect(
      response.status(),
      "Non-boolean flag value should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Invalid flag value should return success: false",
    ).toBe(false);
  },
);

test(
  "PUT /feature-flags fails when the flags field is missing",
  { tag: ["@flagged"] },
  async ({ request }) => {
    // Arrange
    const emptyPayload = {};

    // Act
    const response = await request.put(ApiUrls.featureFlags, {
      data: emptyPayload,
    });
    const body = await readApiResponse<ContactResponseBody>(response);

    // Assert
    expect(
      response.status(),
      "Missing flags field should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Missing flags field should return success: false",
    ).toBe(false);
  },
);
