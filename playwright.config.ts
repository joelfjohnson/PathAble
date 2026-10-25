import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  expect: { timeout: 10000 },
  use: {
    baseURL: process.env.PATHABLE_BASE_URL || "http://127.0.0.1:5173",
    launchOptions: {
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--enable-webgl", "--ignore-gpu-blocklist"],
    },
    headless: true,
  },
  reporter: "list",
});
