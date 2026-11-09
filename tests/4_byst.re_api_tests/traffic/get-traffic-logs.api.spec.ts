import { expect, test } from "../support/traffic/bystre-traffic-api.fixtures";
import {
  createTrafficSessionId,
  expectTrafficLogEntry,
  readTrafficPage,
} from "../support/traffic/bystre-traffic-api.helpers";

test.describe(
  "GET /api/v1/traffic/logs",
  { tag: ["@bystre", "@traffic"] },
  () => {
    test("returns a structurally valid, paginated page of the caller's own traffic, with no authorization required", async ({
      bystreTrafficApi,
    }) => {
      const clientSessionId = createTrafficSessionId();
      const infoResponse = await bystreTrafficApi.getInfo({
        clientSessionId,
      });
      expect(infoResponse.status()).toBe(200);

      const page = await readTrafficPage(
        await bystreTrafficApi.getLogs(
          { pathContains: "traffic/info" },
          { clientSessionId },
        ),
      );
      expect(page.content.length).toBeGreaterThan(0);
      for (const entry of page.content) {
        expectTrafficLogEntry(entry, { clientSessionId });
      }
    });

    test("rejects an invalid time filter with a client error response", async ({
      bystreTrafficApi,
    }) => {
      const response = await bystreTrafficApi.getLogs(
        { from: "not-an-instant" },
        { clientSessionId: createTrafficSessionId() },
      );

      expect(response.status()).toBe(400);
      const body = (await response.json()) as Record<string, unknown>;
      expect(Object.keys(body).length).toBeGreaterThan(0);
    });
  },
);
