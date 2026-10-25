import { test, expect } from "@playwright/test";
import { solveRoute, edges, routeDistance } from "../src/lib/routing";
import { routes } from "../src/data/journey";
test("graph enforces mobility constraints and excludes reported edges", () => {
  expect(solveRoute([])?.routeId).toBe("A");
  expect(solveRoute(["stairs", "ramps", "slopes"])?.routeId).toBe("B");
  expect(solveRoute(["stairs", "ramps"], true)?.routeId).toBe("C");
  expect(
    solveRoute(
      [],
      false,
      edges.map((e) => e.id),
    ),
  ).toBeNull();
  expect(routeDistance(routes[1])).toBeGreaterThan(routeDistance(routes[0]));
});
test("free navigation complete journey and report reroute", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await expect(
    page.getByRole("region", { name: "Why this route" }),
  ).toContainText("Why Route B");
  await page.getByRole("button", { name: /Continue with route B/ }).click();
  await expect(
    page.getByRole("region", { name: "Route navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Open Google Street View/ }),
  ).toHaveAttribute("href", /map_action=pano/);
  await page
    .getByRole("button", { name: "Next direction", exact: true })
    .click();
  await expect(page.locator(".instruction-card")).toContainText("STEP 2");
  await expect(page.locator(".map-tile-loading")).toHaveCount(0, {
    timeout: 30000,
  });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: "tests/free-navigation-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Report a barrier", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Add report & find alternative/ })
    .click();
  await expect(page.locator(".reroute-notice")).toBeVisible();
  await expect(page.locator(".navigation-top")).toContainText("Route C");
  await page.reload();
  await expect(page.locator(".navigation-top")).toContainText("Route C");
  while (
    await page
      .getByRole("button", { name: "Next direction", exact: true })
      .count()
  )
    await page
      .getByRole("button", { name: "Next direction", exact: true })
      .click();
  await page.getByRole("button", { name: "Finish route", exact: true }).click();
  await expect(page.getByRole("heading", { name: /arrived/i })).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile navigation fits screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await page.getByRole("button", { name: /Continue with route B/ }).click();
  await expect(page.locator(".instruction-card")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".map-tile-loading")).toHaveCount(0, {
    timeout: 30000,
  });
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: "tests/free-navigation-mobile.png",
    fullPage: true,
  });
});
