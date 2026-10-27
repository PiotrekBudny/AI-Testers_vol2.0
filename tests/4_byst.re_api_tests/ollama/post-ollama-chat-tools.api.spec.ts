import { expect, test } from "../support/ollama/bystre-ollama-api.fixtures";
import type {
  OllamaChatChunk,
  OllamaProductList,
  OllamaToolDefinition,
} from "../support/ollama/bystre-ollama-api.models";
import { parseSseJsonEvents } from "../support/ollama/bystre-ollama-sse.helpers";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

const model = "qwen3.5:2b";
const beautyPrompt = "What Beauty products do we have available?";
const multiToolPrompt =
  "Walk me through a two-step catalog lookup where you narrate between tool calls";
const expectedBeautyReply =
  "The beauty shelf currently offers: Hydrating Face Serum and Velvet Matte Lipstick. Let me know if you want pricing for either product.";

test.describe(
  "POST /api/v1/ollama/chat/tools",
  { tag: ["@bystre", "@ollama"] },
  () => {
    test.describe.configure({ timeout: 30_000 });

    test("streams a tool call, backend result, and final assistant reply", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const definitionsResponse =
        await bystreOllamaApi.getToolDefinitions(authorization);
      const tools =
        (await definitionsResponse.json()) as OllamaToolDefinition[];

      // Act
      const response = await bystreOllamaApi.chatWithTools(
        {
          model,
          messages: [{ role: "user", content: beautyPrompt }],
          tools,
        },
        authorization,
      );
      const chunks = parseSseJsonEvents<OllamaChatChunk>(
        await response.text(),
      ).map((event) => event.data);
      const callIndex = chunks.findIndex(
        (chunk) => (chunk.message?.tool_calls?.length ?? 0) > 0,
      );
      const toolIndex = chunks.findIndex(
        (chunk) => chunk.message?.role === "tool",
      );
      const toolPayload = JSON.parse(
        chunks[toolIndex]?.message?.content ?? "{}",
      ) as OllamaProductList;
      const assistantReply = chunks
        .slice(toolIndex + 1)
        .filter((chunk) => chunk.message?.role === "assistant")
        .map((chunk) => chunk.message?.content ?? "")
        .join("");
      const doneIndexes = chunks.flatMap((chunk, index) =>
        chunk.done ? [index] : [],
      );

      // Assert
      expect(definitionsResponse.status()).toBe(200);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/event-stream");
      expect(callIndex).toBeGreaterThanOrEqual(0);
      expect(toolIndex).toBeGreaterThan(callIndex);
      expect(
        chunks[callIndex]?.message?.tool_calls?.[0]?.function,
      ).toMatchObject({
        name: "list_products",
        arguments: { category: "beauty", inStockOnly: true },
      });
      expect(chunks[toolIndex]?.message).toMatchObject({
        role: "tool",
        tool_name: "list_products",
      });
      expect(toolPayload).toMatchObject({
        products: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        size: expect.any(Number),
      });
      expect(doneIndexes).toHaveLength(2);
      expect(doneIndexes[0]).toBeLessThan(toolIndex);
      expect(doneIndexes[1]).toBe(chunks.length - 1);
      expect(assistantReply).toBe(expectedBeautyReply);
    });

    test("continues through two tool calls before completing", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;
      const definitionsResponse =
        await bystreOllamaApi.getToolDefinitions(authorization);
      const tools =
        (await definitionsResponse.json()) as OllamaToolDefinition[];

      // Act
      const response = await bystreOllamaApi.chatWithTools(
        {
          model,
          messages: [{ role: "user", content: multiToolPrompt }],
          tools,
        },
        authorization,
      );
      const chunks = parseSseJsonEvents<OllamaChatChunk>(
        await response.text(),
      ).map((event) => event.data);
      const calls = chunks.flatMap(
        (chunk) =>
          chunk.message?.tool_calls?.map((call) => call.function.name) ?? [],
      );
      const results = chunks
        .filter((chunk) => chunk.message?.role === "tool")
        .map((chunk) => chunk.message);
      const assistantText = chunks
        .filter((chunk) => chunk.message?.role === "assistant")
        .map((chunk) => chunk.message?.content ?? "")
        .join("");

      // Assert
      expect(definitionsResponse.status()).toBe(200);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/event-stream");
      expect(calls).toEqual(["list_products", "get_product_snapshot"]);
      expect(results.map((result) => result?.tool_name)).toEqual(calls);
      for (const [index, result] of results.entries()) {
        expect(result?.content, `tool result ${index}`).toEqual(
          expect.any(String),
        );
      }
      expect(chunks.filter((chunk) => chunk.done)).toHaveLength(3);
      expect(chunks.at(-1)?.done).toBe(true);
      expect(assistantText).not.toBe("");
    });

    test("rejects an empty tools array", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.chatWithTools(
        {
          model,
          messages: [{ role: "user", content: beautyPrompt }],
          tools: [],
        },
        authorization,
      );
      const body = (await response.json()) as { error?: string };

      // Assert
      expect(response.status()).toBe(400);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(body.error).toBe("At least one tool definition is required");
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreOllamaApi }) => {
        // Arrange
        const requestAuthorization = authorization;

        // Act
        const response = await bystreOllamaApi.chatWithTools(
          { model, messages: [{ role: "user", content: beautyPrompt }] },
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
