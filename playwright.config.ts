import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./out/hard25/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "./out/hard25/playwright-report.json" }],
  ],
  use: {
    baseURL: "http://localhost:3514",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
