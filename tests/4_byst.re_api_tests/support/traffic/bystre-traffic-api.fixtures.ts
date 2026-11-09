import { test as usersTest } from "../users/bystre-users-api.fixtures";
import { expect } from "../users/bystre-users-api.fixtures";
import { BystreTrafficApiClient } from "./bystre-traffic-api.client";
import {
  createTrafficSessionId,
  readTrafficPage,
} from "./bystre-traffic-api.helpers";
import type {
  TrafficInfoDto,
  TrafficLogEntryDto,
  TrafficRequestOptions,
} from "./bystre-traffic-api.models";

export { expect } from "../users/bystre-users-api.fixtures";

interface BystreTrafficApiFixtures {
  bystreTrafficApi: BystreTrafficApiClient;
  capturedTraffic: {
    options: TrafficRequestOptions;
    sessionId: string;
    info: TrafficInfoDto;
    entries: TrafficLogEntryDto[];
  };
}

export const test = usersTest.extend<BystreTrafficApiFixtures>({
  capturedTraffic: async (
    { bystreTrafficApi, authenticatedUser },
    use,
  ): Promise<void> => {
    const sessionId = createTrafficSessionId();
    const options = {
      clientSessionId: sessionId,
      authorization: `Bearer ${authenticatedUser.token}`,
    };
    let info: TrafficInfoDto | undefined;
    for (let i = 0; i < 3; i += 1) {
      const response = await bystreTrafficApi.getInfo(options);
      expect(response.status()).toBe(200);
      info = (await response.json()) as TrafficInfoDto;
    }
    const page = await readTrafficPage(
      await bystreTrafficApi.getLogs({ page: 0, size: 10 }, options),
    );
    expect(page.totalElements).toBe(3);
    expect(page.content).toHaveLength(3);
    if (!info)
      throw new Error("Traffic fixture did not create an info response.");
    await use({ options, sessionId, info, entries: page.content });
  },
  bystreTrafficApi: async ({ request }, use): Promise<void> => {
    await use(new BystreTrafficApiClient(request));
  },
});
