import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "@playwright/test";

interface OpenApiDocument {
  paths?: Record<string, Record<string, unknown>>;
}

interface OpenApiOperation {
  security?: Array<Record<string, unknown>>;
}

const httpMethods = new Set([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]);

async function getOpenApiDocument(
  request: APIRequestContext,
): Promise<OpenApiDocument> {
  const response = await request.get("/v3/api-docs");

  await expect(response).toBeOK();
  return (await response.json()) as OpenApiDocument;
}

test.describe("Bystre API documentation", () => {
  test(
    "serves the OpenAPI document",
    { tag: ["@bystre", "@smoke"] },
    async ({ request }) => {
      const response = await request.get("/v3/api-docs");

      await expect(response).toBeOK();
    },
  );

  test(
    "serves the Swagger UI",
    { tag: ["@bystre", "@smoke"] },
    async ({ request }) => {
      const response = await request.get("/swagger-ui/index.html");

      await expect(response).toBeOK();
    },
  );

  test(
    "documents the sign-in and forgot-password endpoints",
    { tag: ["@bystre", "@smoke"] },
    async ({ request }) => {
      const openApi = await getOpenApiDocument(request);

      expect(openApi.paths?.["/api/v1/users/signin"]).toHaveProperty("post");
      expect(openApi.paths?.["/api/v1/users/password/forgot"]).toHaveProperty(
        "post",
      );
    },
  );

  test(
    "uses bearerAuth for every protected endpoint",
    { tag: ["@bystre", "@smoke"] },
    async ({ request }) => {
      const openApi = await getOpenApiDocument(request);
      const protectedOperations = Object.entries(openApi.paths ?? {}).flatMap(
        ([path, pathItem]) =>
          Object.entries(pathItem)
            .filter(([method]) => httpMethods.has(method.toLowerCase()))
            .map(([method, operation]) => ({
              path,
              method,
              operation: operation as OpenApiOperation,
            }))
            .filter(({ operation }) => (operation.security?.length ?? 0) > 0),
      );

      expect(protectedOperations.length).toBeGreaterThan(0);

      const nonBearerRequirements = protectedOperations.flatMap(
        ({ path, method, operation }) =>
          (operation.security ?? [])
            .filter((requirement) => !Object.hasOwn(requirement, "bearerAuth"))
            .map((requirement) => ({
              endpoint: `${method.toUpperCase()} ${path}`,
              requirement,
            })),
      );

      expect(nonBearerRequirements).toEqual([]);
    },
  );
});
