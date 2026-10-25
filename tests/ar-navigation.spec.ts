import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function enterAR(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start navigating", exact: true })
    .click();
  await page.getByRole("button", { name: "Make it yours" }).click();
  await page.getByRole("button", { name: "Let's find your way" }).click();
  await page.getByRole("button", { name: "Find accessible routes" }).click();
  await page.getByRole("button", { name: "Continue with route B" }).click();
  await page.getByRole("button", { name: "Start navigation preview" }).click();
  await expect(
    page.getByRole("heading", { name: "Your journey is ready." }),
  ).toBeVisible();
}
async function seek(page: Page, time: number) {
  const slider = page.getByRole("slider", { name: "Scene progress" });
  await slider.evaluate((element, value) => {
    const input = element as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, time);
  await expect(slider).toHaveValue(String(time));
}
test("AR playback, seek, map, ramp, reporting, alternative route and arrival", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterAR(page);
  await page.screenshot({ path: "tests/ar-ready-desktop.png" });
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await expect
    .poll(() =>
      page
        .locator(".ar-scene-media")
        .evaluate((e: HTMLVideoElement) => e.currentTime),
    )
    .toBeGreaterThan(0.3);
  await page.getByRole("button", { name: "Pause journey" }).click();
  const paused = await page
    .getByRole("slider", { name: "Scene progress" })
    .inputValue();
  await page.waitForTimeout(300);
  expect(
    await page.getByRole("slider", { name: "Scene progress" }).inputValue(),
  ).toBe(paused);
  await seek(page, 4);
  await expect
    .poll(() =>
      page
        .locator("video.ar-scene-media")
        .evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeCloseTo(4, 1);
  await expect(page.locator(".ar-path-overlay")).toHaveAttribute(
    "data-overlay-time",
    "4.00",
  );
  await page.getByRole("button", { name: "Resume journey" }).click();
  await expect
    .poll(() =>
      page
        .getByRole("slider", { name: "Scene progress" })
        .inputValue()
        .then(Number),
    )
    .toBeGreaterThan(4.1);
  await page.getByRole("button", { name: "Pause journey" }).click();
  await page.getByRole("button", { name: "Next instruction" }).click();
  await expect(page.locator(".ar-scene-renderer").last()).toHaveAttribute(
    "data-scene-id",
    "intersection",
  );
  await page.getByRole("button", { name: "Previous step" }).click();
  await expect(page.locator(".ar-scene-renderer").last()).toHaveAttribute(
    "data-scene-id",
    "depart",
  );
  await page.getByRole("button", { name: "Next instruction" }).click();
  await page.getByRole("button", { name: "Next instruction" }).click();
  await seek(page, 2);
  await expect(
    page.getByText("Curb ramp along selected route", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open map view" }).click();
  await expect(
    page.getByRole("region", { name: "Expanded journey map" }),
  ).toBeVisible();
  await expect(page.locator(".ar-position-marker")).toBeVisible({
    timeout: 20000,
  });
  await page.getByRole("button", { name: "Return to AR view" }).click();
  await expect(page.locator(".ar-scene-renderer").last()).toHaveAttribute(
    "data-scene-id",
    "curb",
  );
  await page.screenshot({ path: "tests/ar-curb-desktop.png" });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Next instruction" }).click();
  await seek(page, 2);
  await page
    .getByRole("button", { name: "Report obstacle", exact: true })
    .click();
  await page.getByRole("combobox").selectOption("Construction");
  await page
    .getByRole("button", { name: "Add report & find alternative" })
    .click();
  await expect(
    page.getByText("Alternative route ready.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".ar-reroute-transition")).toHaveCount(0);
  await expect(page.locator(".ar-route-chip")).toHaveText("ROUTE C");
  await expect(page.locator(".ar-scene-renderer").last()).toHaveAttribute(
    "data-scene-id",
    "alternative",
  );
  await expect(
    page.getByRole("button", { name: "Resume journey" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume journey" }).click();
  await seek(page, 7.8);
  await expect(page.locator(".ar-scene-renderer").last()).toHaveAttribute(
    "data-scene-id",
    "north-crossing",
  );
  await page.getByRole("button", { name: "Pause journey" }).click();
  await page.getByRole("button", { name: "Next instruction" }).click();
  await page.getByRole("button", { name: "Next instruction" }).click();
  await seek(page, 6.8);
  await page.getByRole("button", { name: "Resume journey" }).click();
  await expect(
    page.getByRole("heading", { name: "You've arrived." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start another journey" }).click();
  await expect(
    page.getByRole("heading", { name: "Where to today?" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile AR, media fallback, reduced motion and refresh recovery", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/ar/videos/**", (route) => route.abort());
  await page.route("**/ar/scenes/bentonville-square.webp", (route) =>
    route.abort(),
  );
  await enterAR(page);
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await expect(
    page.getByRole("img", { name: "Location-neutral sidewalk illustration" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause journey" }).click();
  await seek(page, 3);
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "tests/ar-mobile-fallback.png" });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume journey" }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Scene progress" }),
  ).toHaveValue("3");
  await page.getByRole("button", { name: "Next instruction" }).click();
  await page.getByRole("button", { name: "Next instruction" }).click();
  await seek(page, 2);
  await page.screenshot({ path: "tests/ar-mobile-curb-fallback.png" });
  await expect(page.locator(".ar-world").last()).toHaveCSS("transform", "none");
  for (const size of [
    { width: 320, height: 740 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      size.width,
    );
  }
  await page.getByRole("button", { name: "Restart navigation" }).click();
  await expect(
    page.getByRole("heading", { name: "Your journey is ready." }),
  ).toBeVisible();
});

test("frame-callback fallback, unsupported voice, map failure and autoplay recovery", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(
      HTMLVideoElement.prototype,
      "requestVideoFrameCallback",
      { value: undefined, configurable: true },
    );
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      configurable: true,
    });
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.classList.contains("ar-scene-media"))
        return Promise.reject(
          new DOMException("Blocked for test", "NotAllowedError"),
        );
      return original.call(this);
    };
  });
  await page.route("https://tiles.openfreemap.org/**", (r) => r.abort());
  await enterAR(page);
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await expect(
    page.getByRole("button", { name: "Resume journey" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Playback was paused" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Voice guidance unavailable" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next instruction" }).click();
  await page.getByRole("button", { name: "Resume journey" }).click();
  await expect
    .poll(() => page.getByRole("slider").inputValue().then(Number))
    .toBeGreaterThan(0.3);
  await page.getByRole("button", { name: "Pause journey" }).click();
  await expect(page.locator(".ar-minimap .map-error")).toBeVisible();
  await page.getByRole("button", { name: "Navigation settings" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Unavailable in this browser",
  );
  await page.keyboard.press("Escape");
});

test("voice cancellation, responsive photo alignment, and restart after in-AR reroute", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const calls: { spoken: string[]; cancelled: number } = {
      spoken: [],
      cancelled: 0,
    };
    Object.assign(window, { voiceTest: calls });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        speak: (u: SpeechSynthesisUtterance) => calls.spoken.push(u.text),
        cancel: () => calls.cancelled++,
      },
      configurable: true,
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterAR(page);
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await page.getByRole("button", { name: "Enable voice guidance" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { voiceTest: { spoken: string[] } }).voiceTest
            .spoken.length,
      ),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Pause journey" }).click();
  const cancels = await page.evaluate(
    () =>
      (window as unknown as { voiceTest: { cancelled: number } }).voiceTest
        .cancelled,
  );
  expect(cancels).toBeGreaterThan(0);
  for (const size of [
    { name: "portrait", width: 390, height: 844 },
    { name: "small", width: 320, height: 740 },
    { name: "landscape", width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      size.width,
    );
    await expect
      .poll(() =>
        page.evaluate(() => {
          const media = [...document.querySelectorAll(".ar-scene-media")]
            .at(-1)!
            .getBoundingClientRect();
          const overlay = [...document.querySelectorAll(".ar-path-overlay")]
            .at(-1)!
            .getBoundingClientRect();
          return Math.max(
            Math.abs(media.x - overlay.x),
            Math.abs(media.y - overlay.y),
            Math.abs(media.width - overlay.width),
            Math.abs(media.height - overlay.height),
          );
        }),
      )
      .toBeLessThan(1);
    await page.screenshot({ path: `tests/ar-photo-${size.name}.png` });
  }
  await page.getByRole("button", { name: "Restart navigation" }).click();
  await expect(
    page.getByRole("button", { name: "Start AR journey" }),
  ).toBeInViewport({ ratio: 1 });
  await expect(page.locator(".ar-ready")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "tests/ar-ready-landscape.png" });
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await page.getByRole("button", { name: "Pause journey" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Resume journey" }).click();
  await page
    .getByRole("button", { name: "Report obstacle", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add report & find alternative" })
    .click();
  await expect(
    page.getByRole("button", { name: "Keep journey paused" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".ar-reroute-transition")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Resume journey" }),
  ).toBeVisible();
  await expect(page.locator(".ar-route-chip")).toHaveText("ROUTE C");
  await page.getByRole("button", { name: "Restart navigation" }).click();
  await expect(page.locator(".ar-route-chip")).toHaveText("ROUTE B");
  await expect(
    page.getByRole("heading", { name: "Your journey is ready." }),
  ).toBeVisible();
});

test("invalid persisted navigation index is normalized safely", async ({
  page,
}) => {
  await enterAR(page);
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await page.getByRole("button", { name: "Pause journey" }).click();
  await page.evaluate(() => {
    const state = JSON.parse(sessionStorage.getItem("pathable-journey")!);
    state.ar.sceneIndex = 999;
    state.ar.elapsed = -99;
    state.ar.playing = true;
    sessionStorage.setItem("pathable-journey", JSON.stringify(state));
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Continue to Bentonville City Square." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Resume journey" }),
  ).toBeVisible();
  await expect(page.getByRole("slider")).toHaveValue("0");
});

test("native video timing stays synchronized without video frame callbacks", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(
      HTMLVideoElement.prototype,
      "requestVideoFrameCallback",
      { value: undefined, configurable: true },
    ),
  );
  await enterAR(page);
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await expect
    .poll(() =>
      page
        .locator("video.ar-scene-media")
        .evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(0.4);
  await page.getByRole("button", { name: "Pause journey" }).click();
  const elapsed = Number(await page.getByRole("slider").inputValue()),
    time = await page
      .locator("video.ar-scene-media")
      .evaluate((v: HTMLVideoElement) => v.currentTime);
  expect(Math.abs(time - elapsed)).toBeLessThan(0.25);
});

test("scripted barrier pauses for a choice and can continue without a report", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterAR(page);
  await page.getByRole("button", { name: "Start AR journey" }).click();
  await page.getByRole("button", { name: "Pause journey" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next instruction" }).click();
  await seek(page, 9.8);
  await page.getByRole("button", { name: "Resume journey" }).click();
  await expect(
    page.getByRole("button", { name: "Resume journey" }),
  ).toBeVisible();
  await expect(page.locator(".ar-scene-renderer").last()).toHaveAttribute(
    "data-scene-id",
    "barrier",
  );
  await page.getByRole("button", { name: "Resume journey" }).click();
  await expect(page.locator(".ar-scene-renderer").last()).toHaveAttribute(
    "data-scene-id",
    "square",
  );
  await page.getByRole("button", { name: "Pause journey" }).click();
  await page.getByRole("button", { name: "Complete journey" }).click();
  await expect(
    page.getByRole("heading", { name: "You've arrived." }),
  ).toBeVisible();
});
