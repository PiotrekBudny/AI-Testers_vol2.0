import { expect, test } from "../support/qr/bystre-qr-api.fixtures";

const qrPayload = { text: "https://example.com/bystre-qr-api-test" };
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

test.describe("POST /api/v1/qr/create", { tag: ["@bystre"] }, () => {
  test("returns a PNG QR code for an authenticated nonblank text", async ({
    bystreQrApi,
    authenticatedUser,
  }) => {
    // Arrange
    const authorization = `Bearer ${authenticatedUser.token}`;

    // Act
    const response = await bystreQrApi.create(qrPayload, authorization);

    // Assert
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const body = await response.body();
    expect(body.length).toBeGreaterThan(pngSignature.length);
    expect(body.subarray(0, pngSignature.length)).toEqual(pngSignature);
  });

  test("rejects a request without authorization", async ({ bystreQrApi }) => {
    // Arrange

    // Act
    const response = await bystreQrApi.create(qrPayload);

    // Assert
    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toMatchObject({
      message: expect.stringMatching(/\S+/),
    });
  });

  test("rejects an invalid bearer token", async ({ bystreQrApi }) => {
    // Arrange
    const authorization = "Bearer not.a.jwt";

    // Act
    const response = await bystreQrApi.create(qrPayload, authorization);

    // Assert
    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toMatchObject({
      message: expect.stringMatching(/\S+/),
    });
  });

  for (const { name, data } of [
    { name: "missing text", data: {} },
    { name: "blank text", data: { text: "   " } },
  ]) {
    test(`rejects ${name}`, async ({ bystreQrApi, authenticatedUser }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreQrApi.create(data, authorization);

      // Assert
      expect(response.status()).toBe(400);
      expect(response.headers()["content-type"]).toContain("application/json");
      const body = await response.json();
      expect(body).toEqual(expect.any(Object));
      expect(Object.keys(body).length).toBeGreaterThan(0);
      expect(
        Object.values(body).some(
          (value) => typeof value === "string" && /\S/.test(value),
        ),
      ).toBe(true);
    });
  }
});
