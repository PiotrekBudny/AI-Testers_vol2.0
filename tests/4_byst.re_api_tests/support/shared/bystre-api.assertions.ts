import { type APIResponse, expect } from "@playwright/test";

export const unauthorizedCases = [
  { name: "missing authorization", authorization: undefined },
  { name: "invalid bearer token", authorization: "Bearer invalid-token" },
] as const;

export async function expectApiError(
  response: APIResponse,
  status: number,
): Promise<void> {
  expect(response.status()).toBe(status);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(await response.json()).toMatchObject({
    message: expect.stringMatching(/\S+/),
  });
}

export async function expectBadRequest(
  response: APIResponse,
  field?: string,
): Promise<void> {
  expect(response.status()).toBe(400);
  expect(response.headers()["content-type"]).toContain("application/json");
  const body = await response.json();
  expect(body).toEqual(expect.any(Object));
  expect(Object.keys(body).length).toBeGreaterThan(0);
  if (field) {
    expect(body).toHaveProperty(field, expect.stringMatching(/\S+/));
  } else {
    expect(
      Object.values(body).some(
        (value) => typeof value === "string" && /\S/.test(value),
      ),
    ).toBe(true);
  }
  expect(body).not.toHaveProperty("trace");
}
