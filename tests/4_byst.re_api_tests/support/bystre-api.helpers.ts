import { expect } from "@playwright/test";

import type { BystreLoginResponse } from "./bystre-api.models";

export function requiredBystreCredential(
  value: string | undefined,
  name: string,
): string {
  if (!value?.trim()) {
    throw new Error(
      `Set ${name} in the local .env file before running Bystre API tests.`,
    );
  }

  return value.trim();
}

export function expectBystreLoginAuthState(body: BystreLoginResponse): void {
  if (body.mfaRequired) {
    expect(body).toMatchObject({
      token: null,
      refreshToken: null,
      challengeToken: expect.stringMatching(/\S+/),
      challengeExpiresAt: expect.stringMatching(/\S+/),
    });
    return;
  }

  expect(body).toMatchObject({
    token: expect.stringMatching(/\S+/),
    refreshToken: expect.stringMatching(/\S+/),
    challengeToken: null,
    challengeExpiresAt: null,
  });
}
