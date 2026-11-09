import { expect, test } from "../support/traffic/bystre-traffic-api.fixtures";
import {
  createTrafficSessionId,
  invalidTrafficSessions,
} from "../support/traffic/bystre-traffic-api.helpers";
import type { TrafficInfoDto } from "../support/traffic/bystre-traffic-api.models";

test.describe(
  "GET /api/v1/traffic/info",
  { tag: ["@bystre", "@traffic"] },
  () => {
    test("returns the WebSocket route and a topic scoped to the client session, with no authorization required", async ({
      bystreTrafficApi,
    }) => {
      const clientSessionId = createTrafficSessionId();
      const response = await bystreTrafficApi.getInfo({ clientSessionId });

      expect(response.status()).toBe(200);
      const body = (await response.json()) as TrafficInfoDto;
      expect(body).toEqual({
        webSocketEndpoint: "/api/v1/ws-traffic",
        topic: `/topic/traffic/${clientSessionId}`,
        description:
          "Connect to the WebSocket endpoint and subscribe to the topic to receive real-time HTTP traffic events",
      });
    });

    for (const { name, value } of invalidTrafficSessions) {
      test(
        "rejects a client session ID with " + name,
        async ({ bystreTrafficApi }) => {
          const response = await bystreTrafficApi.getInfo({
            clientSessionId: value,
          });

          expect(response.status()).toBe(400);
          const body = (await response.json()) as Record<string, unknown>;
          expect(Object.keys(body).length).toBeGreaterThan(0);
        },
      );
    }
  },
);
