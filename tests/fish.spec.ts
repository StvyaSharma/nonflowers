import { test, expect, type Page } from "@playwright/test";
import { ready, select, edit } from "./controls";
import {
  defaultFishSettings,
  readFishSettings,
  regions,
  patterns,
  type FishSettings,
} from "../src/fish/settings";
import { simulateReaction } from "../src/fish/reaction";
import { createFishGeometry, regionAt } from "../src/fish/geometry";
const image = (page: Page) =>
  page
    .locator("#canvas-container > canvas")
    .evaluate((node) => (node as HTMLCanvasElement).toDataURL());
const fishURL = (settings: Partial<FishSettings>, seed = "fish-test") =>
  `?subject=fish&seed=${seed}&mode=manual&controls=${encodeURIComponent(JSON.stringify(settings))}`;

test("regional solver is repeatable, finite, coupled, and independent of palette", () => {
  const s = defaultFishSettings();
  s.iterations = 350;
  const first = simulateReaction("cells", s),
    repeat = simulateReaction("cells", { ...s, palette: "reef" });
  expect(Array.from(repeat.values)).toEqual(Array.from(first.values));
  expect(first.active).toBeGreaterThan(1500);
  expect(first.max - first.min).toBeGreaterThan(0.05);
  expect(
    Array.from(first.values).every(
      (v) => Number.isFinite(v) && v >= 0 && v <= 1,
    ),
  ).toBe(true);
  const disconnected = simulateReaction("cells", { ...s, coupling: 0 });
  expect(disconnected.values).not.toEqual(first.values);
  const changed = simulateReaction("cells", { ...s, head_reaction: 0.012 });
  expect(changed.values).not.toEqual(first.values);
  const extreme = simulateReaction("edges", {
    ...s,
    diffusionA: 0.24,
    diffusionB: 0.12,
    anisotropy: 0.8,
    feed: 0.08,
    kill: 0.075,
    iterations: 1800,
  });
  expect(
    Array.from(extreme.values).every(
      (v) => Number.isFinite(v) && v >= 0 && v <= 1,
    ),
  ).toBe(true);
  const validated = readFishSettings({
    iterations: 1e9,
    head_hue: -999,
    feed: null,
    tail_pattern: "invalid",
    coupling: -1,
  });
  expect(validated.iterations).toBe(1800);
  expect(validated.head_hue).toBe(-120);
  expect(validated.feed).toBe(0.035);
  expect(validated.tail_pattern).toBe("shared");
  expect(validated.coupling).toBe(0);
  // Every independently controlled tissue actually occurs in the solver domain.
  const g = createFishGeometry(s),
    seen = new Set<string>();
  for (let y = 100; y < 500; y += 2)
    for (let x = 50; x < 580; x += 2) {
      const r = regionAt(x, y, g);
      if (r) seen.add(r);
    }
  expect([...seen].sort()).toEqual([...regions].sort());
});

test("fish watercolor is visible, repeatable, supports seed/manual controls and PNG export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(fishURL({ pattern: "turing", iterations: 500 }));
  await ready(page);
  const initial = await image(page);
  await page.locator("#canvas-container > canvas").screenshot({
    path: "test-results/fish-watercolor.png",
    animations: "disabled",
  });

  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-subject",
    "fish",
  );
  const range = (await page
    .locator("#canvas-container")
    .getAttribute("data-field-range"))!
    .split(",")
    .map(Number);
  expect(range[1] - range[0]).toBeGreaterThan(0.05);
  const stats = await page
    .locator("#canvas-container > canvas")
    .evaluate((node) => {
      const d = (node as HTMLCanvasElement)
        .getContext("2d")!
        .getImageData(0, 0, 600, 600).data;
      let dark = 0,
        chromatic = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < 150 && d[i + 3] > 0) dark++;
        if (d[i + 3] > 0 && Math.abs(d[i] - d[i + 2]) > 35) chromatic++;
      }
      return { dark, chromatic };
    });
  expect(stats.dark).toBeGreaterThan(1000);
  expect(stats.chromatic).toBeGreaterThan(3000);
  await page.reload();
  await ready(page);
  expect(await image(page)).toBe(initial);
  await page.getByText("Fish pigments", { exact: true }).click();
  await select(page, "Palette", "Reef");
  await ready(page);
  expect(await image(page)).not.toBe(initial);
  await page.getByText("Fish region · Head", { exact: true }).click();
  const head = page
    .locator(".dialkit-folder")
    .filter({
      has: page.getByRole("button", {
        name: "Fish region · Head",
        exact: true,
      }),
    })
    .last();
  await edit(page, "Hue shift", "75", head);
  const manual = await image(page),
    url = page.url();
  expect(JSON.parse(new URL(url).searchParams.get("controls")!).head_hue).toBe(
    75,
  );
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("nonfishes-fish-test.png");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const png = Buffer.concat(chunks);
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(png.readUInt32BE(16)).toBe(600);
  expect(png.readUInt32BE(20)).toBe(600);
  await page.reload();
  await ready(page);
  expect(await image(page)).toBe(manual);
  await select(page, "Generation mode", "Seed");
  await ready(page);
  const seeded = await image(page);
  await select(page, "Generation mode", "Manual");
  await ready(page);
  await select(page, "Generation mode", "Seed");
  await ready(page);
  expect(await image(page)).toBe(seeded);
  await select(page, "Subject", "Plants");
  await ready(page);
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-subject",
    "plant",
  );
  expect(errors).toEqual([]);
});

test("all pattern families differ, regional edits stay local, and brush changes the result", async ({
  page,
}) => {
  const outputs = new Set<string>();
  for (const pattern of patterns) {
    await page.goto(
      fishURL({ pattern, iterations: 250, brushOpacity: 0, ink: 0 }),
    );
    await ready(page);
    outputs.add(await image(page));
  }
  expect(outputs.size).toBe(patterns.length);
  await page.goto(fishURL({ pattern: "spots", brushOpacity: 0, ink: 0 }));
  await ready(page);
  const plain = await image(page);
  await page.goto(fishURL({ pattern: "spots", brushOpacity: 0.7, ink: 0 }));
  await ready(page);
  expect(await image(page)).not.toBe(plain);
  const crop = () =>
    page.locator("#canvas-container > canvas").evaluate((node) => {
      const c = document.createElement("canvas");
      c.width = 65;
      c.height = 60;
      c.getContext("2d")!.drawImage(
        node as HTMLCanvasElement,
        470,
        270,
        65,
        60,
        0,
        0,
        65,
        60,
      );
      return c.toDataURL();
    });
  await page.goto(fishURL({ pattern: "spots", brushOpacity: 0, ink: 0 }));
  await ready(page);
  const tail = await crop(),
    before = await image(page);
  await page.goto(
    fishURL({ pattern: "spots", brushOpacity: 0, ink: 0, head_hue: 90 }),
  );
  await ready(page);
  expect(await image(page)).not.toBe(before);
  expect(await crop()).toBe(tail);
});

test("fish controls fit mobile and rapid subject changes finish with the latest recipe", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("?subject=fish&seed=mobile-fish");
  await ready(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    375,
  );
  await select(page, "Subject", "Plants");
  await select(page, "Subject", "Fish");
  await ready(page);
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-subject",
    "fish",
  );
  await expect(page.locator(".dialkit-root")).toHaveCount(1);
});

test("named recipes apply complete fish settings and layer views expose independent components", async ({
  page,
}) => {
  await page.goto("?seed=recipes");
  await ready(page);
  await page.getByRole("button", { name: "Fish recipes", exact: true }).click();
  await page.getByRole("button", { name: "Reef bars", exact: true }).click();
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-subject",
    "fish",
  );
  await ready(page);
  const settings = JSON.parse(
    new URL(page.url()).searchParams.get("controls")!,
  );
  expect(settings.palette).toBe("reef");
  expect(settings.paleStrength).toBe(0.7);
  expect(settings.pattern).toBe("bars");
  const views = new Set<string>();
  for (const view of [
    "painting",
    "regions",
    "melanin",
    "warm",
    "reflection",
    "reaction",
  ] as const) {
    await page.goto(fishURL({ ...settings, view, iterations: 200 }));
    await ready(page);
    views.add(await image(page));
  }
  expect(views.size).toBe(6);
});
