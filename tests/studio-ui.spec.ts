import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("visual homepage retains route comparison, profile choice and motion controls", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "More freedom.",
  );
  await page
    .getByRole("button", { name: "Shortest route", exact: true })
    .click();
  await expect(page.getByText("Includes modeled stairs")).toBeVisible();
  await page
    .getByRole("button", { name: "Step-free route", exact: true })
    .click();
  await expect(page.getByText("Matches step-free needs")).toBeVisible();
  await page
    .getByRole("button", { name: "Pause background animation" })
    .click();
  await expect(page.locator(".atlas-home")).toHaveAttribute(
    "data-effects-paused",
    "true",
  );
  await page.mouse.move(1100, 370);
  for (const section of await page
    .locator(
      ".atlas-section-heading, .atlas-feature-grid article, .atlas-local-photo, .atlas-local-copy, .atlas-faq > div:first-child, .atlas-final",
    )
    .all()) {
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveCSS("opacity", "1");
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: info.outputPath("homepage-desktop.png"),
    fullPage: true,
  });
  const audit = await new AxeBuilder({ page })
    .include(".atlas-header")
    .include(".atlas-hero")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Powered wheelchair", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await expect(page.locator(".profile-card.selected")).toContainText(
    "Powered wheelchair",
  );
  await page.screenshot({
    path: info.outputPath("profile-desktop.png"),
    fullPage: true,
  });
});

test("mobile homepage stays within viewport and honors reduced motion", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator(".atlas-home")).toHaveAttribute(
      "data-effects-paused",
      "true",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Start navigating", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: info.outputPath(`homepage-${width}.png`),
      fullPage: true,
    });
  }
});
