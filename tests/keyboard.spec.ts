import { test, expect, type Page, type Locator } from "@playwright/test";
async function tabTo(page: Page, locator: Locator) {
  for (let i = 0; i < 25; i++) {
    if (await locator.evaluate((el) => document.activeElement === el)) return;
    await page.keyboard.press("Tab");
  }
  await expect(locator).toBeFocused();
}
test("keyboard-only journey entry and modal focus restoration", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await tabTo(
    page,
    page.getByRole("button", { name: "Start navigating", exact: true }),
  );
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "How do you prefer to travel?" }),
  ).toBeFocused();
  await tabTo(
    page,
    page.getByRole("button", { name: /Manual wheelchair Smoother/ }),
  );
  await page.keyboard.press("Space");
  await tabTo(page, page.getByRole("button", { name: "Make it yours" }));
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Your journey, your needs." }),
  ).toBeFocused();
  await tabTo(
    page,
    page.getByRole("switch", { name: "Avoid uneven sidewalks" }),
  );
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("switch", { name: "Avoid uneven sidewalks" }),
  ).toBeChecked();
  await tabTo(page, page.getByRole("button", { name: "Let's find your way" }));
  await page.keyboard.press("Enter");
  await tabTo(
    page,
    page.getByRole("button", { name: "Find accessible routes" }),
  );
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  await tabTo(
    page,
    page.getByRole("button", { name: "Report an example barrier" }),
  );
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Report an example barrier" }),
  ).toBeFocused();
});
