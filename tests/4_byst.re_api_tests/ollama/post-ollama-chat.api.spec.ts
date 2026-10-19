import { expect, test } from "../support/ollama/bystre-ollama-api.fixtures";
import type { OllamaChatChunk } from "../support/ollama/bystre-ollama-api.models";
import { parseSseJsonEvents } from "../support/ollama/bystre-ollama-sse.helpers";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

const model = "qwen3.5:2b";
const prompt = "Give me a quick status update on the Ollama mock";
const messages = [{ role: "user", content: prompt }];
const expectedContent =
  "The Ollama mock is up on port 11434, defaults to qwen3.5:2b, and streams deterministic responses so backend/frontend teams can skip the heavy container during the local profile.";
const expectedThinking =
  "Reviewing the latest notes about the local mock server and its qwen3.5:2b default...";

test.describe(
  "POST /api/v1/ollama/chat",
  { tag: ["@bystre", "@ollama"] },
  () => {
    test.describe.configure({ timeout: 30_000 });

    test("streams lossless assistant content and thinking", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.chat(
        { model, messages, think: true },
        authorization,
      );
      const chunks = parseSseJsonEvents<OllamaChatChunk>(
        await response.text(),
      ).map((event) => event.data);
      const content = chunks
        .map((chunk) => chunk.message?.content ?? "")
        .join("");
      const thinking = chunks
        .map((chunk) => chunk.message?.thinking ?? "")
        .join("");

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/event-stream");
      expect(chunks.length).toBeGreaterThan(2);
      for (const [index, chunk] of chunks.entries()) {
        expect(chunk, `stream chunk ${index}`).toMatchObject({
          model,
          created_at: expect.any(String),
          done: index === chunks.length - 1,
        });
      }
      for (const [index, chunk] of chunks.slice(0, -1).entries()) {
        expect(chunk.message?.role, `role in chunk ${index}`).toBe("assistant");
      }
      expect(content).toBe(expectedContent);
      expect(thinking).toBe(expectedThinking);
    });

    test("omits thinking when think is false", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.chat(
        { model, messages, think: false },
        authorization,
      );
      const chunks = parseSseJsonEvents<OllamaChatChunk>(
        await response.text(),
      ).map((event) => event.data);
      const content = chunks
        .map((chunk) => chunk.message?.content ?? "")
        .join("");

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/event-stream");
      expect(content).toBe(expectedContent);
      for (const [index, chunk] of chunks.entries()) {
        expect(
          chunk.message?.thinking,
          `thinking in chunk ${index}`,
        ).toBeFalsy();
      }
      expect(chunks.at(-1)?.done).toBe(true);
    });

    test("rejects empty conversation history", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.chat(
        { model, messages: [] },
        authorization,
      );
      const body = (await response.json()) as Record<string, string>;

      // Assert
      expect(response.status()).toBe(400);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(body.messages).toMatch(/\S+/);
    });

    test("rejects a message with an invalid role", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.chat(
        { model, messages: [{ role: "bot", content: prompt }] },
        authorization,
      );
      const body = (await response.json()) as Record<string, string>;

      // Assert
      expect(response.status()).toBe(400);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(Object.keys(body)).toEqual(
        expect.arrayContaining([expect.stringMatching(/role/)]),
      );
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreOllamaApi }) => {
        // Arrange
        const requestAuthorization = authorization;

        // Act
        const response = await bystreOllamaApi.chat(
          { model, messages },
          requestAuthorization,
        );
        const body = (await response.json()) as { message?: string };

        // Assert
        expect(response.status()).toBe(401);
        expect(response.headers()["content-type"]).toContain(
          "application/json",
        );
        expect(body.message).toMatch(/\S+/);
      });
    }
  },
);
