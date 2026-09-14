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
      testMatch:
        /.*1_designing_framework_and_processes_with_AI\/auth\/setup\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Smoke tests - fast checks without authentication
    {
      name: "smoke-tests",
      testMatch:
        /.*1_designing_framework_and_processes_with_AI\/main\.smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Playwright CLI tests - new test suite using Playwright CLI
    {
      name: "playwright-cli",
      testMatch: /.*2_playwright_cli\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Authenticated tests that mutate data - must finish before the demo user logs out
    {
      name: "authenticated-fields",
      testMatch:
        /.*1_designing_framework_and_processes_with_AI\/authenticated\/fields\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // Authenticated tests that end with logout - runs after setup
    // Demo-user tests can run independently without being blocked by authenticated-fields failures
    {
      name: "authenticated-profile",
      testMatch:
        /.*1_designing_framework_and_processes_with_AI\/authenticated\/demo-user\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
