import { type APIResponse, expect } from "@playwright/test";

import type {
  SystemPromptDto,
  SystemPromptField,
} from "./bystre-users-api.models";

export async function readSystemPrompt(
  response: APIResponse,
  field: SystemPromptField,
): Promise<string> {
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  const body = (await response.json()) as SystemPromptDto;
  expect(body).toEqual({ [field]: expect.stringMatching(/\S+/) });
  return body[field] as string;
}
