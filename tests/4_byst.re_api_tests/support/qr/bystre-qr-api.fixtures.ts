import { test as usersTest } from "../users/bystre-users-api.fixtures";
import { BystreQrApiClient } from "./bystre-qr-api.client";

interface BystreQrApiFixtures {
  bystreQrApi: BystreQrApiClient;
}

export const test = usersTest.extend<BystreQrApiFixtures>({
  bystreQrApi: async ({ request }, use): Promise<void> => {
    await use(new BystreQrApiClient(request));
  },
});

export { expect } from "@playwright/test";
