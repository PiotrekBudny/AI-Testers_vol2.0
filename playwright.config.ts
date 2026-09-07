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
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
