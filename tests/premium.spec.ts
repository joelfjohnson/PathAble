import { test, expect, type Page } from "@playwright/test";
async function dashboard(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("button", { name: "Let's find your way" }).click();
}
test("cinematic intro, cursor, phone interaction, storytelling and app entry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Navigation without barriers." }),
  ).toBeVisible();
  await expect(page.locator(".headline-word").last()).toHaveCSS("opacity", "1");
  await expect(page.locator(".phone-render")).toBeVisible();
  const bounds = await page.locator(".hero-art").boundingBox();
  await page.mouse.move(
    bounds!.x + bounds!.width * 0.8,
    bounds!.y + bounds!.height * 0.4,
  );
  await expect(page.locator(".interactive-cursor")).toHaveAttribute(
    "data-visible",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator(".hero-art")
        .evaluate((e) => e.style.getPropertyValue("--phone-y")),
    )
    .not.toBe("");
  await page.screenshot({ path: "tests/premium-home-desktop.png" });
  await page.locator(".personal-story").scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: /Walker or cane Steadier surfaces/ })
    .click();
  await expect(
    page.getByRole("button", { name: /Walker or cane Steadier surfaces/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".visual-story").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "02 Find the connection" }).click();
  await expect(page.locator(".visual-preview-frame>img")).toHaveAttribute(
    "src",
    "/ar/scenes/crossing.svg",
  );
  await page.screenshot({ path: "tests/premium-scroll-story.png" });
  await page.locator("#community").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Preview alternative route" }).click();
  await expect(page.locator(".community-route-demo")).toHaveClass(/rerouted/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .hover();
  await expect(page.locator(".interactive-cursor")).toHaveAttribute(
    "data-active",
    "true",
  );
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await expect(
    page.getByRole("status", { name: "Entering your PathAble journey" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How do you prefer to travel?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Walker or cane A steadier/ }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});
test("free-form destination stays intact and keyboard selects the featured journey", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await dashboard(page);
  const input = page.getByRole("combobox", {
    name: "Destination",
    exact: true,
  });
  await input.fill("Community Library, New York");
  await input.press("Enter");
  await expect(input).toHaveValue("Community Library, New York");
  await expect(
    page.getByRole("heading", { name: "Where to today?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Explore PathAble's featured Bentonville journey",
    }),
  ).toBeVisible();
  await input.focus();
  await input.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: /Bentonville City Square/ }),
  ).toHaveAttribute("aria-selected", "true");
  await input.press("Enter");
  await expect(input).toHaveValue("Bentonville City Square");
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  const shortest = page
    .locator(".route-card")
    .filter({ hasText: "Shortest route" });
  await shortest.hover();
  await expect(page.locator(".map-wrap")).toHaveAttribute(
    "data-highlighted-route",
    "A",
  );
  await expect(page.locator(".route-card.selected")).toContainText(
    "Accessibility-focused",
  );
  await shortest.getByRole("button").click();
  await expect(page.locator(".map-wrap")).toHaveAttribute(
    "data-selected-route",
    "A",
  );
  await page.screenshot({ path: "tests/premium-dashboard.png" });
});
test("AR viewpoints progress from pickup through crossings to destination", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await dashboard(page);
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await page.getByRole("button", { name: "Continue with route B" }).click();
  await page.getByRole("button", { name: "Start navigation preview" }).click();
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await page.getByRole("button", { name: "Pause journey" }).click();
  const sources: string[] = [];
  for (let i = 0; i < 5; i++) {
    const scene = page.locator(".ar-scene-renderer").last();
    sources.push(
      (await scene.locator(".ar-scene-media").getAttribute("src")) || "",
    );
    if (i < 4)
      await page.getByRole("button", { name: "Next instruction" }).click();
  }
  expect(new Set(sources).size).toBe(4);
  expect(sources[0]).toContain("square-reference");
  expect(sources[1]).toContain("crossing.svg");
  expect(sources[2]).toContain("square-reference");
  expect(sources[3]).toContain("barrier.svg");
  await expect(
    page.getByText("Bentonville reference photo · 2013", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Complete journey" }).click();
  await expect(
    page.getByRole("heading", { name: "You've arrived." }),
  ).toBeVisible();
});
