import { randomUUID } from "node:crypto";

import {
  type APIRequestContext,
  type APIResponse,
  request as playwrightRequest,
} from "@playwright/test";

import type { RegisterResponseData } from "../../src/api/types/auth";
import type { ApiSuccessResponse } from "../../src/api/types/common";
import type {
  Animal,
  Assignment,
  Field,
  Staff,
} from "../../src/api/types/farm";
import { ApiUrls } from "../../src/api/urls";
import { config } from "../../src/config/environment";
import type { User } from "../../src/models/User";
import { createTestUser } from "../../src/test-data/users";

export async function readApiResponse<TResponse>(
  response: APIResponse,
): Promise<TResponse> {
  return response.json() as Promise<TResponse>;
}

/**
 * Registers a brand-new user via a disposable request context so the caller's
 * shared `request` fixture stays free of the auth cookie registration sets,
 * which matters for tests asserting on missing/invalid-token behavior.
 */
export async function registerFreshUser(
  overrides: Partial<User> = {},
): Promise<{ user: User; token: string; userId: number }> {
  const context = await playwrightRequest.newContext({
    baseURL: config.BASE_URL,
  });
  const user = createTestUser(overrides);
  const response = await context.post(ApiUrls.register, {
    data: {
      email: user.email,
      password: user.password,
      displayedName: user.displayName,
    },
  });
  const body =
    await readApiResponse<ApiSuccessResponse<RegisterResponseData>>(response);
  await context.dispose();
  return { user, token: body.data.token, userId: body.data.user.id };
}

export async function createOwnedField(
  request: APIRequestContext,
  token: string,
  overrides: Partial<{ name: string; district: string; area: number }> = {},
): Promise<Field> {
  const response = await request.post(ApiUrls.fields, {
    headers: { token },
    data: { name: "Test Field", district: "Mazovia", area: 12.5, ...overrides },
  });
  const body = await readApiResponse<ApiSuccessResponse<Field>>(response);
  return body.data;
}

/** Creates an owned field for a test that only needs its id (e.g. marketplace offers). */
export async function createFieldForUser(
  request: APIRequestContext,
  token: string,
): Promise<number> {
  const field = await createOwnedField(request, token, {
    name: `Test Field ${randomUUID()}`,
    area: 10,
    district: "PL-MZ",
  });
  return field.id;
}

export async function createOwnedStaff(
  request: APIRequestContext,
  token: string,
  overrides: Partial<{ name: string; surname: string; age: number }> = {},
): Promise<Staff> {
  const response = await request.post(ApiUrls.staff, {
    headers: { token },
    data: { name: "Test", surname: "Worker", age: 30, ...overrides },
  });
  const body = await readApiResponse<ApiSuccessResponse<Staff>>(response);
  return body.data;
}

export async function createOwnedAnimal(
  request: APIRequestContext,
  token: string,
  overrides: Partial<{ type: string; amount: number }> = {},
): Promise<Animal> {
  const response = await request.post(ApiUrls.animals, {
    headers: { token },
    data: { type: "cow", amount: 5, ...overrides },
  });
  const body = await readApiResponse<ApiSuccessResponse<Animal>>(response);
  return body.data;
}

export async function createAssignment(
  request: APIRequestContext,
  token: string,
  fieldId: number,
  staffId: number,
): Promise<Assignment> {
  const response = await request.post(ApiUrls.fieldsAssign, {
    headers: { token },
    data: { fieldId, staffId },
  });
  const body = await readApiResponse<ApiSuccessResponse<Assignment>>(response);
  return body.data;
}

export async function fundUserAccount(
  request: APIRequestContext,
  token: string,
  amount: number,
): Promise<void> {
  await request.post(ApiUrls.financialTransactions, {
    headers: { token },
    data: {
      type: "income",
      amount,
      description: "Test account funding",
      category: "general",
      cardNumber: "4242424242424242",
      cvv: "123",
    },
  });
}

export async function createFundedUser(
  request: APIRequestContext,
  amount: number,
): Promise<{ user: User; token: string; userId: number }> {
  const registered = await registerFreshUser();
  await fundUserAccount(request, registered.token, amount);
  return registered;
}

/** Recursively checks whether `key` appears anywhere in `value` (object/array tree). */
export function containsKey(value: unknown, key: string): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => containsKey(item, key));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(
      ([entryKey, entryValue]) =>
        entryKey === key || containsKey(entryValue, key),
    );
  }
  return false;
}
