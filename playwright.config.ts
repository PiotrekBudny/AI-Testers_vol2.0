import { defineConfig, devices } from "@playwright/test";
import { config } from "./src/config/environment";

export default defineConfig({
  testDir: "./tests",
  timeout: 10_000,
  fullyParallel: true,
  retries: config.isCI ? 2 : 0,
  reporter: config.isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    baseURL: config.BASE_URL,
  },

  projects: [
    // Setup project for authentication
    {
      name: "setup",
      testMatch: /.*auth\/setup\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Smoke tests - fast checks without authentication
    {
      name: "smoke-tests",
      testMatch: /.*smoke\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Authenticated tests - require successful setup
    {
      name: "authenticated",
      testMatch: /.*authenticated\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
