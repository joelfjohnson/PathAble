import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("keyboard, modal focus, and WCAG checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const screen of [
    "home",
    "profile",
    "preferences",
    "dashboard",
    "routes",
  ]) {
    await expect(
      page.getByRole("heading", {
        name: (
          {
            home: "Navigation without barriers.",
            profile: "How do you prefer to travel?",
            preferences: "Your journey, your needs.",
            dashboard: "Where to today?",
            routes: "Your way forward.",
          } as Record<string, string>
        )[screen],
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading").first().locator("..")).toHaveCSS(
      "opacity",
      "1",
    );
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    console.log(
      screen,
      JSON.stringify(
        result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      ),
    );
    expect
      .soft(
        result.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      )
      .toEqual([]);
    if (screen === "home")
      await page
        .getByRole("button", { name: "Start navigating", exact: true })
        .click();
    if (screen === "profile")
      await page.getByRole("button", { name: "Make it yours" }).click();
    if (screen === "preferences")
      await page.getByRole("button", { name: "Let's find your way" }).click();
    if (screen === "dashboard") {
      await page
        .getByRole("button", { name: "Find accessible routes" })
        .click();
      await expect(
        page.getByRole("heading", { name: "Your way forward." }),
      ).toBeVisible();
    }
  }
  await page.getByRole("button", { name: "Report an example barrier" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("navigation preparation, step controls, and arrival accessibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await page.getByRole("button", { name: "Continue with route B" }).click();
  for (const screen of ["prepare", "navigation", "arrived"]) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect
      .soft(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      )
      .toEqual([]);
    if (screen === "prepare")
      await page
        .getByRole("button", { name: "Start navigation preview" })
        .click();
    if (screen === "navigation") {
      await page.getByRole("button", { name: "Start AR journey" }).click();
      await page.getByRole("button", { name: "Pause journey" }).click();
      for (let i = 0; i < 4; i++)
        await page.getByRole("button", { name: "Next instruction" }).click();
      await page.getByRole("button", { name: "Complete journey" }).click();
    }
  }
});
