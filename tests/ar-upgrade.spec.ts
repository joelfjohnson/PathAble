import { test, expect, type Page } from "@playwright/test";
async function openJourney(page: Page) {
  await page.goto("/");
  for (const name of [
    "Start navigating",
    "Make it yours",
    "Let's find your way",
    "Find accessible routes",
    "Continue with route B",
    "Start navigation preview",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("heading", { name: "Your journey is ready." }).waitFor();
  await expect
    .poll(() =>
      page
        .locator(".ar-scene-media")
        .last()
        .evaluate((el: HTMLVideoElement | HTMLImageElement) =>
          el instanceof HTMLVideoElement ? el.readyState : el.naturalWidth,
        ),
    )
    .toBeGreaterThan(1);
}
async function checkScene(page: Page, id: string) {
  const scene = page.locator(".ar-scene-renderer").last();
  await expect(scene).toHaveAttribute("data-scene-id", id);
  await expect(scene).toHaveAttribute("data-media-fallback", "false");
  await expect
    .poll(() =>
      scene
        .locator(".ar-scene-media")
        .evaluate((el: HTMLImageElement | HTMLVideoElement) =>
          el instanceof HTMLVideoElement ? el.videoWidth : el.naturalWidth,
        ),
    )
    .toBeGreaterThan(100);
  await expect
    .poll(() =>
      scene
        .locator(".ar-media-plane")
        .evaluate((el) => el.getBoundingClientRect().width),
    )
    .toBeGreaterThan(300);
  await page.screenshot({ path: `tests/ar-upgrade-${id}.png` });
}
test("every real-world scene loads through the complete B to C journey", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openJourney(page);
  await page.screenshot({ path: "tests/ar-upgrade-ready.png" });
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await page.getByRole("button", { name: "Pause journey" }).click();
  for (const id of ["depart", "intersection", "curb", "barrier"]) {
    await checkScene(page, id);
    if (id !== "barrier")
      await page.getByRole("button", { name: "Next instruction" }).click();
  }
  await page
    .getByRole("button", { name: "Report obstacle", exact: true })
    .click();
  await page.getByRole("combobox").selectOption("Construction");
  await page
    .getByRole("button", { name: "Add report & find alternative" })
    .click();
  await expect(page.locator(".ar-reroute-transition")).toHaveCount(0);
  for (const id of ["alternative", "north-crossing", "rejoin", "square"]) {
    await checkScene(page, id);
    if (id !== "square")
      await page.getByRole("button", { name: "Next instruction" }).click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "tests/ar-upgrade-mobile.png" });
  await page.getByRole("button", { name: "Complete journey" }).click();
  await expect(
    page.getByRole("heading", { name: "You've arrived." }),
  ).toBeVisible();
});
test("failed video retains a real poster and continues on the local clock", async ({
  page,
}) => {
  await page.route("**/ar/videos/**", (r) => r.abort());
  await page.goto("/");
  for (const name of [
    "Start navigating",
    "Make it yours",
    "Let's find your way",
    "Find accessible routes",
    "Continue with route B",
    "Start navigation preview",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator(".ar-scene-renderer")).toHaveAttribute(
    "data-media-fallback",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator("img.ar-scene-media")
        .evaluate((e: HTMLImageElement) => e.naturalWidth),
    )
    .toBeGreaterThan(100);
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await expect
    .poll(() =>
      page
        .getByRole("slider", { name: "Scene progress" })
        .inputValue()
        .then(Number),
    )
    .toBeGreaterThan(0.3);
});
