import { createCanvas } from "../rendering/canvas";
import { createBrushPainter } from "./brush";
import { growField } from "./field";
import { createFishGeometry } from "./geometry";
import { hashSeed, randomStream, sampleFishSettings } from "./random";
import { readFishSettings, regions, type FishSettings } from "./settings";
import {
  paintTissue,
  paintScales,
  paintFinRays,
  paintDetails,
} from "./surface";
import type { PatternField } from "./reaction";
export interface FishPainting {
  painting: HTMLCanvasElement;
  background: HTMLCanvasElement;
  fishSettings: FishSettings;
  field?: PatternField;
}
function paper(seed: string, grain: number, size: number): HTMLCanvasElement {
  const ctx = createCanvas(size),
    image = ctx.createImageData(size, size),
    random = randomStream(`${seed}:paper`);
  for (let i = 0; i < image.data.length; i += 4) {
    const noise = (random() - 0.5) * grain * 28;
    image.data[i] = 246 + noise;
    image.data[i + 1] = 237 + noise;
    image.data[i + 2] = 213 + noise;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return ctx.canvas;
}
export function createFishGenerator() {
  const brush = createBrushPainter();
  let cache: { key: string; field: PatternField } | undefined;
  return {
    async render(
      seed: string,
      manual: FishSettings | undefined,
      signal: AbortSignal,
    ): Promise<FishPainting> {
      const s = manual ? readFishSettings(manual) : sampleFishSettings(seed),
        g = createFishGeometry(s);
      const needsField =
        s.pattern === "turing" ||
        (s.secondaryMix > 0 && s.secondary === "turing") ||
        s.view === "reaction" ||
        regions.some((r) => s[`${r}_pattern`] === "turing");
      let field: PatternField | undefined;
      if (needsField) {
        // Pigment-only edits reuse the numerical field. Anatomy and all chemistry
        // inputs participate in the key; cached state never evolves across renders.
        const key = JSON.stringify([
          seed,
          g,
          s.feed,
          s.kill,
          s.diffusionA,
          s.diffusionB,
          s.iterations,
          s.anisotropy,
          s.coupling,
          s.lateralCue,
          s.patternScale,
          regions.map((r) => s[`${r}_reaction`]),
        ]);
        field =
          cache?.key === key ? cache.field : await growField(seed, s, signal);
        if (signal.aborted) throw new DOMException("Superseded", "AbortError");
        cache = { key, field };
      }
      const ctx = createCanvas(600),
        background = paper(seed, s.paperGrain, 128);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(9, 9, 582, 582, 27);
      ctx.clip();
      ctx.drawImage(paper(seed, s.paperGrain, 600), 0, 0);
      const phase = hashSeed(`${seed}:phase`) / 4294967296;
      for (const fin of g.fins.filter((f) => f.region !== "pectoral")) {
        paintTissue(ctx, g, s, phase, field, fin);
        paintFinRays(ctx, fin, s);
      }
      paintTissue(ctx, g, s, phase, field);
      paintScales(ctx, g, s, seed);
      const pectoral = g.fins.find((f) => f.region === "pectoral")!;
      paintTissue(ctx, g, s, phase, field, pectoral);
      paintFinRays(ctx, pectoral, s);
      if (s.view === "painting") {
        const marks = await brush.paint(seed, s, g);
        if (signal.aborted) throw new DOMException("Superseded", "AbortError");
        ctx.save();
        ctx.beginPath();
        for (const points of [g.body, ...g.fins.map((f) => f.points)]) {
          ctx.moveTo(...points[0]);
          for (const point of points.slice(1)) ctx.lineTo(...point);
          ctx.closePath();
        }
        ctx.clip();
        // The brush compositor includes white paper. Multiply preserves the pigment
        // raster beneath it; clipping confines watercolor to the anatomical silhouette.
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(marks, 0, 0);
        ctx.restore();
      }
      paintDetails(ctx, g, s);
      ctx.restore();
      return { painting: ctx.canvas, background, fishSettings: s, field };
    },
    dispose() {
      cache = undefined;
      brush.dispose();
    },
  };
}
