import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    launchOptions: {
      executablePath: "/home/sam/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome",
    },
  },
});
