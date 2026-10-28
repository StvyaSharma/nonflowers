import { sampleField, type PatternField } from "./reaction";
import type { FishSettings, Pattern, Region } from "./settings";
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export function patternValue(
  pattern: Pattern,
  u: number,
  v: number,
  s: FishSettings,
  field: PatternField | undefined,
  x: number,
  y: number,
  scale = 1,
  phase = 0,
  seedPhase = 0,
): number {
  const f = s.patternScale * scale;
  const warp =
    s.patternWarp *
    (Math.sin(u * 13 + v * 5 + seedPhase) + 0.5 * Math.sin(v * 17 - u * 9));
  const a = u * f + warp * 0.3 + phase + seedPhase,
    b = v * f * 0.3 + warp * 0.2 + phase;
  let value = 0;
  switch (pattern) {
    case "solid":
      return 0;
    case "stripes":
      value = 0.5 + 0.5 * Math.sin(b * Math.PI * 2);
      break;
    case "bars":
      value = 0.5 + 0.5 * Math.sin(a * Math.PI * 2);
      break;
    case "spots":
    case "ocelli":
    case "reticulation": {
      const row = Math.floor(b),
        dx = a + (row % 2) * 0.5 - Math.floor(a + (row % 2) * 0.5) - 0.5,
        dy = b - Math.floor(b) - 0.5;
      const distance = Math.hypot(dx, dy);
      value =
        pattern === "spots"
          ? 1 - distance * 2
          : pattern === "ocelli"
            ? 1 - Math.abs(distance - 0.3) * 5
            : distance * 1.6;
      break;
    }
    case "marble":
      value =
        0.5 +
        0.5 * Math.sin((a * 0.5 + Math.sin(b * 2) + Math.sin(a + b)) * Math.PI);
      break;
    case "turing":
      value = field ? sampleField(field, x, y) : 0;
      break;
  }
  const threshold = 1 - s.patternCoverage;
  return smooth(threshold - 0.12, threshold + 0.12, value);
}
export function regionalPattern(
  region: Region,
  u: number,
  v: number,
  x: number,
  y: number,
  s: FishSettings,
  field: PatternField | undefined,
  seedPhase: number,
): number {
  const primary = patternValue(
    s.pattern,
    u,
    v,
    s,
    field,
    x,
    y,
    1,
    0,
    seedPhase,
  );
  const secondary = patternValue(
    s.secondary,
    u,
    v,
    s,
    field,
    x,
    y,
    1.7,
    0.21,
    seedPhase,
  );
  const shared = primary * (1 - s.secondaryMix) + secondary * s.secondaryMix;
  const choice = s[`${region}_pattern`];
  const local = patternValue(
    choice === "shared" ? s.pattern : choice,
    u,
    v,
    s,
    field,
    x,
    y,
    s[`${region}_scale`],
    s[`${region}_phase`],
    seedPhase,
  );
  // A regional solid is an explicit pattern-free override.
  if (choice === "solid") return 0;
  return (
    s[`${region}_strength`] *
    (local * (1 - s[`${region}_inherit`]) + shared * s[`${region}_inherit`])
  );
}
