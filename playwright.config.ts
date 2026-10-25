import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const browserCandidates =
  process.platform === "win32"
    ? [
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
        "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
      ]
    : process.platform === "darwin"
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : [];
const executablePath =
  process.env.PATHABLE_BROWSER_PATH || browserCandidates.find(existsSync);
export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  expect: { timeout: 10000 },
  use: {
    baseURL: process.env.PATHABLE_BASE_URL || "http://127.0.0.1:5173",
    launchOptions: {
      executablePath,
      args: ["--enable-webgl", "--ignore-gpu-blocklist"],
    },
    headless: true,
  },
  reporter: "list",
});
