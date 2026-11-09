import { expect, test } from "../support/ollama/bystre-ollama-api.fixtures";
import type { OllamaGenerateChunk } from "../support/ollama/bystre-ollama-api.models";
import { parseSseJsonEvents } from "../support/ollama/bystre-ollama-sse.helpers";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

const model = "qwen3.5:2b";
const prompt = "Summarize the release plan";
const expectedResponse =
  "Release plan: qwen3.5:2b is the default mock model, frontend hooks can stay untouched, and integration smoke test is scheduled after Phase 4. Ping me if you need more depth.";
const expectedThinking =
  "Reviewing the qwen3.5:2b release checklist before drafting the summary...";

test.describe(
  "POST /api/v1/ollama/generate",
  { tag: ["@bystre", "@ollama"] },
  () => {
    test.describe.configure({ timeout: 30_000 });

    test("streams lossless response and thinking chunks", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.generate(
        { model, prompt, think: true },
        authorization,
      );
      const events = parseSseJsonEvents<OllamaGenerateChunk>(
        await response.text(),
      );
      const chunks = events.map((event) => event.data);
      const responseText = chunks.map((chunk) => chunk.response ?? "").join("");
      const thinkingText = chunks.map((chunk) => chunk.thinking ?? "").join("");

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
      expect(responseText).toBe(expectedResponse);
      expect(thinkingText).toBe(expectedThinking);
    });

    test("omits thinking when think is false", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.generate(
        { model, prompt, think: false },
        authorization,
      );
      const chunks = parseSseJsonEvents<OllamaGenerateChunk>(
        await response.text(),
      ).map((event) => event.data);
      const responseText = chunks.map((chunk) => chunk.response ?? "").join("");

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/event-stream");
      expect(responseText).toBe(expectedResponse);
      for (const [index, chunk] of chunks.entries()) {
        expect(chunk.thinking, `thinking in chunk ${index}`).toBeFalsy();
      }
      expect(chunks.at(-1)?.done).toBe(true);
    });

    test("rejects blank model and prompt", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.generate(
        { model: "", prompt: "" },
        authorization,
      );
      const body = (await response.json()) as Record<string, string>;

      // Assert
      expect(response.status()).toBe(400);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(body.model).toMatch(/\S+/);
      expect(body.prompt).toMatch(/\S+/);
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreOllamaApi }) => {
        // Arrange
        const requestAuthorization = authorization;

        // Act
        const response = await bystreOllamaApi.generate(
          { model, prompt },
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
