import type p5 from "p5";
import { PI, sin, pow, mapval, sigmoid } from "./math";
import type { Parameters } from "./parameters";
import type { ManualSettings } from "./settings";
import type { ColorRange } from "./types";

export function compileParameters(
  sketch: p5,
  settings: ManualSettings,
): Parameters {
  const color = (
    prefix: "flower" | "leaf" | "inner" | "branch",
  ): ColorRange => ({
    min: [
      settings[`${prefix}HueMin`],
      settings[`${prefix}SaturationMin`],
      settings[`${prefix}ValueMin`],
      settings[`${prefix}AlphaMin`],
    ],
    max: [
      settings[`${prefix}HueMax`],
      settings[`${prefix}SaturationMax`],
      settings[`${prefix}ValueMax`],
      settings[`${prefix}AlphaMax`],
    ],
  });
  return {
    flowerChance: settings.flowerChance,
    leafChance: settings.leafChance,
    leafLength: settings.leafLength,
    flowerLength: settings.flowerLength,
    pedicelLength: settings.pedicelLength,
    leafWidth: settings.leafWidth,
    flowerWidth: settings.flowerWidth,
    stemWidth: settings.stemWidth,
    stemBend: settings.stemBend,
    stemLength: settings.stemLength,
    stemCount: settings.stemCount,
    sheathLength: settings.sheathLength,
    sheathWidth: settings.sheathWidth,
    shootCount: settings.shootCount,
    shootLength: settings.shootLength,
    flowerPetal: settings.flowerPetal,
    innerLength: settings.innerLength,
    innerWidth: settings.innerWidth,
    branchWidth: settings.branchWidth,
    branchTwist: settings.branchTwist,
    branchDepth: settings.branchDepth,
    branchFork: settings.branchFork,
    leafType:
      settings.leafVeinMode === "none"
        ? [0]
        : [
            settings.leafVeinMode === "parallel" ? 1 : 2,
            settings.leafVeinCount,
            settings.leafVeinSpacing,
          ],
    leafPosition: settings.leafPlacement === "base" ? 1 : 2,
    flowerShape: (x) =>
      sketch.noise(x * settings.flowerJaggedness, settings.flowerNoiseSeed) *
      pow(sin(PI * x), settings.flowerMaskPower),
    leafShape: (x) =>
      settings.leafShapeMode === "noise"
        ? sketch.noise(x * settings.leafJaggedness, settings.leafNoiseSeed) *
          pow(sin(PI * x), settings.leafMaskPower)
        : pow(sin(PI * x), settings.leafPointiness),
    flowerOpenCurve: (x, openness) =>
      settings.flowerOpeningMode === "noise"
        ? x < settings.openingThreshold
          ? 2 + openness * settings.openingAmount
          : sketch.noise(x * 10, settings.openingNoiseSeed)
        : x < settings.openingThreshold
          ? 0
          : settings.openingAmount -
            x * mapval(openness, 0, 1, 16, 20) * settings.openingScale,
    flowerColorCurve: (x) =>
      sigmoid(x + settings.flowerColorOffset, settings.flowerColorSteepness),
    innerShape: (x) => pow(sin(PI * x), settings.innerShapePower),
    flowerColor: color("flower"),
    leafColor: color("leaf"),
    innerColor: color("inner"),
    branchColor: color("branch"),
  };
}
