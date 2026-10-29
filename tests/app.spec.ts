import { test, expect, type Page } from "@playwright/test";

async function ready(page: Page, seed: string): Promise<void> {
  await page.goto(`?seed=${encodeURIComponent(seed)}`);
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator("#loader")).toBeHidden();
}

async function pixels(page: Page): Promise<string> {
  return page
    .locator("#canvas-container > canvas")
    .evaluate((node) => (node as HTMLCanvasElement).toDataURL());
}

test("renders an actual painting, repeats seeds, and changes output for another seed", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await ready(page, "1234");
  const first = await pixels(page);
  const stats = await page
    .locator("#canvas-container > canvas")
    .evaluate((node) => {
      const canvas = node as HTMLCanvasElement;
      const data = canvas.getContext("2d")!.getImageData(0, 0, 600, 600).data;
      let transparent = 0;
      let dark = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) transparent++;
        if (data[i + 3] > 0 && data[i] < 150) dark++;
      }
      return { width: canvas.width, height: canvas.height, transparent, dark };
    });
  expect(stats.width).toBe(600);
  expect(stats.height).toBe(600);
  expect(stats.transparent).toBeGreaterThan(0);
  expect(stats.dark).toBeGreaterThan(100);
  await ready(page, "1234");
  expect(await pixels(page)).toBe(first);
  await ready(page, "flowers");
  expect(await pixels(page)).not.toBe(first);
  expect(errors).toEqual([]);
});

test("DialKit replaces the legacy panels and supports seed editing, downloads, sharing, and regeneration", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page, "test");
  await expect(page.locator(".dialkit-root")).toHaveCount(1);
  await expect(
    page.locator("#options, #settings, #summary, #share, #manual-controls"),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Seed", exact: true })
    .fill("花 & petal?");
  await expect(page).toHaveURL(/seed=/);
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect
    .poll(() => new URL(page.url()).searchParams.get("seed"))
    .toBe("花 & petal?");
  await page
    .getByRole("button", { name: "Copy share link", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    page.url(),
  );
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("nonflowers-花___petal_.png");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const png = Buffer.concat(chunks);
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(png.readUInt32BE(16)).toBe(600);
  expect(png.readUInt32BE(20)).toBe(600);
  await page.getByRole("button", { name: "New painting", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("seed"))
    .not.toBe("花 & petal?");
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-mode",
    "seed",
  );
  expect(errors).toEqual([]);
});

test("canvas and controls fit a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await ready(page, "mobile");
  const box = await page.locator("#canvas-container > canvas").boundingBox();
  expect(box!.width).toBeLessThanOrEqual(375);
  expect(box!.height).toBe(box!.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    375,
  );
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeVisible();
});
