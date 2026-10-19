import { expect, test } from "../support/ollama/bystre-ollama-api.fixtures";
import type { OllamaToolDefinition } from "../support/ollama/bystre-ollama-api.models";
import { unauthorizedCases } from "../support/shared/bystre-api.assertions";

test.describe(
  "GET /api/v1/ollama/chat/tools/definitions",
  { tag: ["@bystre", "@ollama"] },
  () => {
    test("returns the backend tool schemas to an authenticated client", async ({
      bystreOllamaApi,
      authenticatedUser,
    }) => {
      // Arrange
      const authorization = `Bearer ${authenticatedUser.token}`;

      // Act
      const response = await bystreOllamaApi.getToolDefinitions(authorization);
      const definitions = (await response.json()) as OllamaToolDefinition[];
      const toolNames = definitions.map(
        (definition) => definition.function.name,
      );
      const snapshot = definitions.find(
        (definition) => definition.function.name === "get_product_snapshot",
      );
      const list = definitions.find(
        (definition) => definition.function.name === "list_products",
      );

      // Assert
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(definitions).toHaveLength(2);
      expect(toolNames.sort()).toEqual([
        "get_product_snapshot",
        "list_products",
      ]);
      for (const definition of definitions) {
        expect(definition.type, definition.function.name).toBe("function");
      }
      expect(snapshot?.function.parameters).toMatchObject({
        type: "object",
        properties: {
          productId: { type: "integer" },
          name: { type: "string" },
        },
        oneOf: [{ required: ["productId"] }, { required: ["name"] }],
      });
      expect(list?.function.parameters).toMatchObject({
        type: "object",
        properties: {
          offset: { type: "integer" },
          limit: { type: "integer" },
          category: { type: "string" },
          inStockOnly: { type: "boolean" },
        },
      });
    });

    for (const { name, authorization } of unauthorizedCases) {
      test(`rejects ${name}`, async ({ bystreOllamaApi }) => {
        // Arrange
        const requestAuthorization = authorization;

        // Act
        const response =
          await bystreOllamaApi.getToolDefinitions(requestAuthorization);
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
