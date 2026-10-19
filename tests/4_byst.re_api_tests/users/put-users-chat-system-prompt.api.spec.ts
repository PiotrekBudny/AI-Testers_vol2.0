import {
  expectApiError,
  unauthorizedCases,
} from "../support/shared/bystre-api.assertions";
import { readSystemPrompt } from "../support/users/bystre-user-prompts.helpers";
import { expect, test } from "../support/users/bystre-users-api.fixtures";

test.describe(
  "PUT /api/v1/users/chat-system-prompt",
  { tag: ["@bystre", "@prompts"] },
  () => {
    test("updates and persists the current user's prompt", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      const authorization = "Bearer " + authenticatedUser.token;
      const value = "Answer concisely and cite your sources.";
      const response = await bystreUsersApi.updateSystemPrompt(
        "chat",
        { chatSystemPrompt: value },
        authorization,
      );
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({ chatSystemPrompt: value });
      expect(
        await readSystemPrompt(
          await bystreUsersApi.getSystemPrompt("chat", authorization),
          "chatSystemPrompt",
        ),
      ).toBe(value);
    });

    // Known defect: a malformed JSON body returns 401 Unauthorized instead of
    // 400 Bad Request, even with a valid bearer token. Reproduced on this
    // endpoint and on the public POST /api/v1/users/signup, so it looks like
    // a global request-body-parsing exception mapped to the auth error path.
    // This test documents the current (incorrect) behavior; update it to
    // expect 400 once the defect is fixed.
    test("returns 401 instead of 400 for a malformed JSON body (known defect)", async ({
      request,
      authenticatedUser,
    }) => {
      const response = await request.put("/api/v1/users/chat-system-prompt", {
        headers: {
          Authorization: "Bearer " + authenticatedUser.token,
          "Content-Type": "application/json",
        },
        data: "{",
      });
      expect(response.status()).toBe(401);
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreUsersApi }) => {
        await expectApiError(
          await bystreUsersApi.updateSystemPrompt(
            "chat",
            { chatSystemPrompt: "Unauthorized change" },
            authorization,
          ),
          401,
        );
      });
    }
  },
);
