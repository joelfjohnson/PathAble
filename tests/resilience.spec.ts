import { test, expect } from "@playwright/test";
test("profile defaults, browser back, refresh recovery, photo upload, and mobile map expansion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Limited walking mobility A little/ })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await expect(
    page.getByRole("heading", { name: "Your journey, your needs." }),
  ).toBeVisible();
  await page.getByText("Comfort & convenience", { exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Minimize travel distance" }),
  ).toBeChecked();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "How do you prefer to travel?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Limited walking mobility A little/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("switch", { name: "Avoid steep inclines" }).uncheck();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await page.getByRole("button", { name: "Show more map" }).click();
  await expect(
    page.getByRole("button", { name: "Open journey controls" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Open journey controls" }).click();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  await expect(page.locator(".route-card.selected")).toContainText(
    "Shortest route",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  await expect(page.locator(".route-card.selected")).toContainText(
    "Shortest route",
  );
  await page.getByRole("button", { name: "Report an example barrier" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "barrier.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jrPcAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByAltText("Selected obstacle report")).toBeVisible();
  await page
    .getByRole("button", { name: "Add report & find alternative" })
    .click();
  await expect(page.locator(".route-card.selected")).toContainText(
    "Alternative accessible route",
  );
  await page.reload();
  await expect(page.locator(".reroute-notice")).toContainText(
    "blocked curb ramp",
  );
});

test("back cancels route processing and rerouting", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Where to today?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await expect(
    page.getByRole("heading", { name: "Your way forward." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Report an example barrier" }).click();
  await page
    .getByRole("button", { name: "Add report & find alternative" })
    .click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Where to today?" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Where to today?" }),
  ).toBeVisible();
});
