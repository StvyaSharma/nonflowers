import { test, expect, type Page } from "@playwright/test";
import { edit, select } from "./controls";

async function ready(page: Page): Promise<void> {
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-ready",
    "true",
  );
}
async function image(page: Page): Promise<string> {
  return page
    .locator("#canvas-container > canvas")
    .evaluate((node) => (node as HTMLCanvasElement).toDataURL());
}

test("manual controls change the painting, preserve their state in URLs and downloads, and return to the original seed", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("?seed=1234");
  await ready(page);
  const seeded = await image(page);
  await select(page, "Generation mode", "Manual");
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-mode",
    "manual",
  );
  await ready(page);
  await page.getByText("Plant", { exact: true }).click();
  await select(page, "Plant type", "Herbal");
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-plant-type",
    "herbal",
  );
  await ready(page);
  await page.getByText("Stems", { exact: true }).click();
  await edit(page, "Stem count", "1");
  await edit(page, "Stem width", "20");
  expect(await image(page)).not.toBe(seeded);
  await page.getByText("Flowers", { exact: true }).click();
  await edit(page, "Flower probability", "1");
  await edit(page, "Petals", "4");
  await page.getByText("Flower colors", { exact: true }).click();
  const color = page
    .locator(".dialkit-folder")
    .filter({
      has: page.locator(".dialkit-folder-title", {
        hasText: /^Flower colors$/,
      }),
    })
    .last();
  await edit(page, "Min hue", "200", color);
  await page.getByText("Paper and rendering", { exact: true }).click();
  await edit(page, "Noise falloff", "0.8");
  await edit(page, "Noise octaves", "8");
  const manual = await image(page);
  const savedURL = page.url();
  const settings = JSON.parse(new URL(savedURL).searchParams.get("controls")!);
  expect(settings.stemCount).toBe(1);
  expect(settings.stemWidth).toBe(20);
  expect(settings.flowerPetal).toBe(4);
  expect(settings.flowerHueMin).toBe(200);
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  expect((await downloading).suggestedFilename()).toBe("nonflowers-1234.png");
  await page.reload();
  await ready(page);
  expect(await image(page)).toBe(manual);
  await expect(
    page.getByRole("button", { name: /^Generation mode/ }),
  ).toContainText("Manual");
  await page.getByText("Stems", { exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "Stem width", exact: true }),
  ).toHaveAttribute("aria-valuenow", "20");
  await select(page, "Generation mode", "Seed");
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-mode",
    "seed",
  );
  await ready(page);
  expect(await image(page)).toBe(seeded);
  expect(new URL(page.url()).searchParams.has("controls")).toBe(false);
  expect(errors).toEqual([]);
});

test("invalid imported controls are bounded and manual controls fit on mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 375, height: 812 });
  const settings = {
    plantType: "herbal",
    stemCount: 999,
    branchDepth: 100,
    leafVeinSpacing: 0,
    flowerHueMin: -100,
    noiseFalloff: null,
  };
  await page.goto(
    `?seed=manual-validation&mode=manual&controls=${encodeURIComponent(JSON.stringify(settings))}`,
  );
  await ready(page);
  await page.getByText("Branches", { exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "Branch depth", exact: true }),
  ).toHaveAttribute("aria-valuenow", "4");
  await page.getByText("Leaves", { exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "Diagonal vein spacing", exact: true }),
  ).toHaveAttribute("aria-valuenow", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    375,
  );
  expect(errors).toEqual([]);
});
