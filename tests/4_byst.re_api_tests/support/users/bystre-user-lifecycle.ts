import type { APIResponse } from "@playwright/test";

import type { BystreUsersApiClient } from "./bystre-users-api.client";
import type { BystreSignupRequest } from "./bystre-users-api.models";

export async function requireBystreStatus(
  request: Promise<APIResponse>,
  stage: string,
  expectedStatus: number,
): Promise<APIResponse> {
  let response: APIResponse;
  try {
    response = await request;
  } catch {
    // Native request errors can include Authorization headers and credentials.
    throw new Error(
      `Bystre fixture ${stage}: request failed before an HTTP response. Check API availability and BYSTRE_API_BASE_URL.`,
    );
  }

  if (response.status() !== expectedStatus) {
    throw new Error(
      `Bystre fixture ${stage}: expected HTTP ${expectedStatus}, received HTTP ${response.status()}.`,
    );
  }

  return response;
}

export async function signInBystreUser(
  api: BystreUsersApiClient,
  user: Readonly<BystreSignupRequest>,
): Promise<string> {
  const response = await requireBystreStatus(
    api.login({ username: user.username, password: user.password }),
    "sign-in (POST /api/v1/users/signin)",
    200,
  );

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      "Bystre fixture sign-in: HTTP 200 response was not valid JSON.",
    );
  }

  if (
    body === null ||
    typeof body !== "object" ||
    !("mfaRequired" in body) ||
    body.mfaRequired !== false
  ) {
    throw new Error(
      "Bystre fixture sign-in: HTTP 200 response must have mfaRequired=false for a newly registered user.",
    );
  }

  if (
    !("token" in body) ||
    typeof body.token !== "string" ||
    !body.token.trim()
  ) {
    throw new Error(
      "Bystre fixture sign-in: HTTP 200 response did not contain a nonempty access token.",
    );
  }

  return body.token;
}

export async function deleteBystreUser(
  api: BystreUsersApiClient,
  user: Readonly<BystreSignupRequest>,
  token?: string,
): Promise<void> {
  // Recovery login is attempted once only when setup did not supply a token.
  const cleanupToken = token ?? (await signInBystreUser(api, user));
  await requireBystreStatus(
    api.deleteOwnAccount(user.username, `Bearer ${cleanupToken}`),
    "account deletion teardown (DELETE /api/v1/users/{username}/right-to-be-forgotten)",
    204,
  );
}
