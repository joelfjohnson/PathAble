import { test, expect } from "@playwright/test";
test("homepage animation playback", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("video")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video: HTMLVideoElement) => video.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await page.getByRole("button", { name: "Pause phone animation" }).click();
  await expect(page.locator("video")).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: "Play phone animation" }).click();
  await expect(page.locator("video")).toHaveJSProperty("paused", false);
});
test("responsive homepage", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const size of [
    { name: "desktop", width: 1440, height: 960 },
    { name: "laptop", width: 1280, height: 800 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
    { name: "small", width: 320, height: 740 },
  ]) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      size.width,
    );
    await expect(page.locator(".phone-static")).toBeVisible();
    await page.screenshot({ path: `tests/visual-${size.name}.png` });
  }
});
