import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";
import { readSystemPrompt } from "../support/users/bystre-user-prompts.helpers";
import { expect, test } from "../support/users/bystre-users-api.fixtures";

test.describe(
  "GET /api/v1/users/tool-system-prompt",
  { tag: ["@bystre", "@prompts"] },
  () => {
    test("returns the effective default for a new user", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      const prompt = await readSystemPrompt(
        await bystreUsersApi.getSystemPrompt(
          "tool",
          "Bearer " + authenticatedUser.token,
        ),
        "toolSystemPrompt",
      );
      expect(prompt.trim().length).toBeGreaterThan(0);
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreUsersApi }) => {
        await expectApiError(
          await bystreUsersApi.getSystemPrompt("tool", authorization),
          401,
        );
      });
    }
  },
);
