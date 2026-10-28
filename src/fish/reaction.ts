import { createFishGeometry, regionAt, bodyCoordinates } from "./geometry";
import { randomStream } from "./random";
import { regions, type FishSettings } from "./settings";
export const FIELD_WIDTH = 180;
export const FIELD_HEIGHT = 150;
export interface PatternField {
  width: number;
  height: number;
  values: Float32Array;
  min: number;
  max: number;
  active: number;
}
/** Gray–Scott U/V chemistry on the fish silhouette, with reflecting (no-flux) edges.
 * U is substrate and V is autocatalyst; these are not measured pigment cells.
 * Regional conductance and feed bias are artistic analogues of tissue interactions.
 */
export function simulateReaction(seed: string, s: FishSettings): PatternField {
  const width = FIELD_WIDTH,
    height = FIELD_HEIGHT,
    n = width * height;
  const g = createFishGeometry(s),
    random = randomStream(`${seed}:reaction`);
  let a = new Float32Array(n).fill(1),
    b = new Float32Array(n);
  let nextA = new Float32Array(n),
    nextB = new Float32Array(n);
  const tissue = new Int8Array(n).fill(-1),
    feed = new Float32Array(n);
  let active = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * width + x,
        px = ((x + 0.5) * 600) / width,
        py = ((y + 0.5) * 600) / height;
      const region = regionAt(px, py, g);
      if (!region) continue;
      active++;
      tissue[i] = regions.indexOf(region);
      const [u, v] = bodyCoordinates(px, py, g);
      feed[i] =
        s.feed +
        s[`${region}_reaction`] +
        s.lateralCue * 0.003 * Math.exp(-v * v * 35);
      // Seed perturbations throughout the domain; a weak axial cue orients growth.
      const spot =
        Math.sin(u * s.patternScale * Math.PI * 2) *
          Math.cos(v * s.patternScale * 0.8) >
        0.8;
      if (
        random() < 0.035 ||
        spot ||
        (Math.abs(v) < 0.04 && random() < s.lateralCue)
      ) {
        a[i] = 0.45 + random() * 0.1;
        b[i] = 0.2 + random() * 0.25;
      }
    }
  // Precompute edges once. An absent neighbour reflects the current value.
  const neighbours = new Int32Array(n * 4).fill(-1),
    weights = new Float32Array(n * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (tissue[i] < 0) continue;
      const candidates = [
        x > 0 ? i - 1 : -1,
        x < width - 1 ? i + 1 : -1,
        y > 0 ? i - width : -1,
        y < height - 1 ? i + width : -1,
      ];
      candidates.forEach((j, k) => {
        if (j < 0 || tissue[j] < 0) return;
        neighbours[i * 4 + k] = j;
        weights[i * 4 + k] =
          (tissue[i] === tissue[j] ? 1 : s.coupling) *
          (k < 2 ? 1 + s.anisotropy : 1 - s.anisotropy);
      });
    }
  for (let step = 0; step < s.iterations; step++) {
    for (let i = 0; i < n; i++) {
      if (tissue[i] < 0) continue;
      let lapA = 0,
        lapB = 0;
      for (let k = 0; k < 4; k++) {
        const edge = i * 4 + k,
          j = neighbours[edge];
        if (j < 0) continue;
        lapA += weights[edge] * (a[j] - a[i]);
        lapB += weights[edge] * (b[j] - b[i]);
      }
      const reaction = a[i] * b[i] * b[i];
      nextA[i] = Math.max(
        0,
        Math.min(
          1,
          a[i] + 0.8 * (s.diffusionA * lapA - reaction + feed[i] * (1 - a[i])),
        ),
      );
      nextB[i] = Math.max(
        0,
        Math.min(
          1,
          b[i] +
            0.8 * (s.diffusionB * lapB + reaction - (s.kill + feed[i]) * b[i]),
        ),
      );
    }
    [a, nextA] = [nextA, a];
    [b, nextB] = [nextB, b];
  }
  let min = 1,
    max = 0;
  for (let i = 0; i < n; i++)
    if (tissue[i] >= 0) {
      min = Math.min(min, b[i]);
      max = Math.max(max, b[i]);
    }
  // Fixed concentration mapping preserves extinction and contrast across parameter edits.
  for (let i = 0; i < n; i++)
    b[i] = tissue[i] < 0 ? 0 : Math.min(1, b[i] / 0.42);
  return { width, height, values: b, min, max, active };
}
export function sampleField(field: PatternField, x: number, y: number): number {
  const fx = Math.max(
    0,
    Math.min(field.width - 1, (x / 600) * field.width - 0.5),
  );
  const fy = Math.max(
    0,
    Math.min(field.height - 1, (y / 600) * field.height - 0.5),
  );
  const x0 = Math.floor(fx),
    y0 = Math.floor(fy),
    x1 = Math.min(x0 + 1, field.width - 1),
    y1 = Math.min(y0 + 1, field.height - 1);
  const u = fx - x0,
    v = fy - y0,
    at = (xx: number, yy: number) => field.values[yy * field.width + xx];
  return (
    (at(x0, y0) * (1 - u) + at(x1, y0) * u) * (1 - v) +
    (at(x0, y1) * (1 - u) + at(x1, y1) * u) * v
  );
}
