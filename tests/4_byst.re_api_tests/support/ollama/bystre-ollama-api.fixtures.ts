import { test as usersTest } from "../users/bystre-users-api.fixtures";
import { BystreOllamaApiClient } from "./bystre-ollama-api.client";

interface BystreOllamaApiFixtures {
  bystreOllamaApi: BystreOllamaApiClient;
}

export const test = usersTest.extend<BystreOllamaApiFixtures>({
  bystreOllamaApi: async ({ request }, use): Promise<void> => {
    await use(new BystreOllamaApiClient(request));
  },
});

export { expect } from "@playwright/test";
