import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("visual homepage retains route comparison, profile choice and motion controls", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Navigation Without Barriers",
  );
  await expect(page.locator(".feature-marquee")).toBeVisible();
  await expect(page.locator(".feature-marquee-track")).toHaveCSS(
    "animation-name",
    "atlas-marquee",
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
    .getByRole("button", { name: "Avoid example barrier", exact: true })
    .click();
  await expect(
    page.getByRole("img", {
      name: "Alternative route avoiding the example barrier",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Around the reported example barrier"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Avoid example barrier", exact: true })
    .click();
  await expect(
    page.getByRole("img", {
      name: "Step-free route around the modeled stairs",
    }),
  ).toBeVisible();
  await page
    .getByLabel("Mobility profile for route preview")
    .selectOption("powered");
  await expect(
    page.getByRole("button", { name: "Powered wheelchair", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const cta = await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .boundingBox();
  await page.mouse.move(cta!.x + cta!.width / 2, cta!.y + cta!.height / 2);
  await expect(page.locator(".interactive-cursor")).toHaveAttribute(
    "data-visible",
    "true",
  );
  await expect(page.locator(".interactive-cursor")).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator(".cinema-scenery-pan img")
        .evaluate((node) => (node as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const startingTransform = await page
    .locator(".cinema-scenery-pan")
    .evaluate((node) => getComputedStyle(node).transform);
  await expect
    .poll(() =>
      page
        .locator(".cinema-scenery-pan")
        .evaluate((node) => getComputedStyle(node).transform),
    )
    .not.toBe(startingTransform);
  await page.screenshot({ path: info.outputPath("cinematic-hero.png") });
  await page
    .getByRole("button", { name: "Pause background animation" })
    .click();
  await expect(page.locator(".atlas-home")).toHaveAttribute(
    "data-effects-paused",
    "true",
  );
  await expect(page.locator(".cinema-scenery-pan")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await expect(page.locator(".interactive-cursor")).toHaveCount(0);
  await page.mouse.move(1100, 370);
  await expect(
    page.locator(".atlas-local-gallery .atlas-local-photo"),
  ).toHaveCount(5);
  const pilotBounds = await page.locator("#local").boundingBox();
  const faqBounds = await page.locator("#questions").boundingBox();
  expect(
    pilotBounds &&
      faqBounds &&
      pilotBounds.y + pilotBounds.height <= faqBounds.y,
  ).toBe(true);
  await expect(page.locator(".atlas-human-photo img")).toHaveAttribute(
    "alt",
    /wheelchair user/i,
  );
  for (const section of await page
    .locator(
      ".atlas-section-heading, .atlas-feature-grid article, .atlas-human-photo, .atlas-human-copy, .atlas-local-gallery, .atlas-local-photo, .atlas-local-copy, .atlas-faq > div:first-child, .atlas-final",
    )
    .all()) {
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveCSS("opacity", "1");
  }
  for (const image of await page
    .locator(".atlas-human-photo img, .atlas-local-gallery img")
    .all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const img = element as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }),
      )
      .toBe(true);
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
    await expect(page.locator(".feature-marquee-track")).toHaveCSS(
      "animation-name",
      "none",
    );
    for (const image of await page.locator(".atlas-local-gallery img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((element) => {
            const img = element as HTMLImageElement;
            return img.complete && img.naturalWidth > 0;
          }),
        )
        .toBe(true);
    }
    const pilotBounds = await page.locator("#local").boundingBox();
    const faqBounds = await page.locator("#questions").boundingBox();
    expect(
      pilotBounds &&
        faqBounds &&
        pilotBounds.y + pilotBounds.height <= faqBounds.y,
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`homepage-${width}.png`),
      fullPage: true,
    });
  }
});
