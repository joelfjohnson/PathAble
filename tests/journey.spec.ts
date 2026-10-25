import { test, expect } from "@playwright/test";
test("complete featured journey, reporting and rerouting", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.stack || e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Navigation without barriers." }),
  ).toBeVisible();
  await page.screenshot({ path: "tests/home-desktop.png", fullPage: true });
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Manual wheelchair Smoother/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Powered wheelchair Space/ }).click();
  await expect(
    page.getByRole("button", { name: /Powered wheelchair Space/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: /Manual wheelchair Smoother/ })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await expect(
    page.getByRole("switch", { name: "Avoid steep inclines" }),
  ).toBeChecked();
  await page.getByRole("switch", { name: "Avoid uneven sidewalks" }).check();
  await page.getByText("Comfort & convenience", { exact: true }).click();
  await page
    .getByRole("switch", { name: "Include seating and rest stops" })
    .check();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await page
    .getByRole("combobox", { name: "Destination", exact: true })
    .fill("Unsupported place");
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await expect(page.getByRole("alert")).toContainText("Choose the featured");
  await page
    .getByRole("combobox", { name: "Destination", exact: true })
    .focus();
  await page
    .getByRole("option", {
      name: /Bentonville City Square Featured destination/,
    })
    .click();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await page
    .locator(".route-select")
    .filter({ hasText: "Shortest route" })
    .click();
  await expect(page.locator(".route-card.selected")).toContainText(
    "Shortest route",
  );
  await page
    .locator(".route-select")
    .filter({ hasText: "Accessibility-focused" })
    .click();
  await expect(page.locator(".hazard-marker")).toBeVisible({ timeout: 20000 });
  await page.screenshot({ path: "tests/routes-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Report an example barrier" }).click();
  await page.getByRole("combobox").selectOption("Construction");
  await page
    .getByRole("textbox", { name: "What should we know?" })
    .fill("An example barrier blocks this part of the path.");
  await page
    .getByRole("button", { name: "Add report & find alternative" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  await expect(page.locator(".route-card.selected")).toContainText(
    "Alternative accessible route",
  );
  await expect(page.locator(".hazard-marker")).toHaveText("!");
  await page.getByRole("button", { name: "Continue with route C" }).click();
  await page.getByRole("button", { name: "Start navigation preview" }).click();
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await page.getByRole("button", { name: "Pause journey" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next instruction" }).click();
  await page.getByRole("button", { name: "Complete journey" }).click();
  await expect(
    page.getByRole("heading", { name: "You've arrived." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start another journey" }).click();
  await expect(
    page.getByRole("heading", { name: "Where to today?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Avoid uneven sidewalks" }),
  ).toBeChecked();
  expect(errors).toEqual([]);
});
test("mobile layout, map, and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "tests/home-mobile.png", fullPage: true });
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  await expect(page.locator(".hazard-marker")).toBeVisible({ timeout: 20000 });
  await page.screenshot({ path: "tests/routes-mobile.png", fullPage: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "tests/phone-screen.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "PathAble home" }).click();
  await expect(page.locator(".phone-static")).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
});
