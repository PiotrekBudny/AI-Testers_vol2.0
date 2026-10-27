import { unauthorizedCases } from "../support/shared/bystre-api.assertions";
import { expect, test } from "../support/users/bystre-users-api.fixtures";
import type { SystemPromptDto } from "../support/users/bystre-users-api.models";

test.describe(
  "PUT /api/v1/users/tool-system-prompt",
  { tag: ["@bystre", "@users", "@prompts"] },
  () => {
    test("updates and persists the current user's prompt", async ({
      bystreUsersApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const value = "Only call tools you have been given; never guess.";

      // Act
      const response = await bystreUsersApi.updateSystemPrompt(
        "tool",
        { toolSystemPrompt: value },
        authorization,
      );
      const body = (await response.json()) as SystemPromptDto;
      const lookup = await bystreUsersApi.getSystemPrompt(
        "tool",
        authorization,
      );
      const persisted = (await lookup.json()) as SystemPromptDto;

      // Assert
      expect(response.status()).toBe(200);
      expect(body).toEqual({ toolSystemPrompt: value });
      expect(lookup.status()).toBe(200);
      expect(persisted).toEqual({ toolSystemPrompt: value });
    });

    test("reports a malformed JSON body as a bad request", async ({
      request,
      authenticatedUser,
    }) => {
      // Arrange
      const path = "/api/v1/users/tool-system-prompt";
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await request.put(path, {
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        data: "{",
      });
      const body = await response.json();

      // Assert
      expect(response.status()).toBe(400);
      expect(body).toMatchObject({
        status: 400,
        error: expect.stringMatching(/\S+/),
        path,
      });
    });

    for (const { name, authorization } of unauthorizedCases) {
      test("rejects " + name, async ({ bystreUsersApi }) => {
        // Arrange
        const value = "Unauthorized change";

        // Act
        const response = await bystreUsersApi.updateSystemPrompt(
          "tool",
          { toolSystemPrompt: value },
          authorization,
        );
        const body = await response.json();

        // Assert
        expect(response.status()).toBe(401);
        expect(body).toHaveProperty("message", expect.stringMatching(/\S+/));
      });
    }
  },
);
