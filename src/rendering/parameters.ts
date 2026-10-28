// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
import type p5 from "p5";
import { PI, sin, pow, sigmoid, mapval } from "./math";
import { createRandom } from "./random";
import { defaultSettings, type ManualSettings } from "./settings";
// generate random parameters
export function sampleParameters(sketch: p5) {
  const { randChoice, normRand } = createRandom(sketch);
  var randint = (x: number, y: number) => Math.floor(normRand(x, y));

  var flowerShapeMask = (x: number) => pow(sin(PI * x), 0.2);
  var leafShapeMask = (x: number) => pow(sin(PI * x), 0.5);

  const flowerChance = randChoice([normRand(0, 0.08), normRand(0, 0.03)]);
  const leafChance = randChoice([0, normRand(0, 0.1), normRand(0, 0.1)]);
  const leafType = randChoice([
    [1, randint(2, 5)],
    [2, randint(3, 7), randint(3, 8)],
    [2, randint(3, 7), randint(3, 8)],
  ]);

  var flowerShapeNoiseSeed = sketch.random() * PI;
  var flowerJaggedness = normRand(0.5, 8);
  const flowerShape = (x: number) =>
    sketch.noise(x * flowerJaggedness, flowerShapeNoiseSeed) *
    flowerShapeMask(x);

  var leafShapeNoiseSeed = sketch.random() * PI;
  var leafJaggedness = normRand(0.1, 40);
  var leafPointyness = normRand(0.5, 1.5);
  const leafShapes = [
    (x: number) =>
      sketch.noise(x * leafJaggedness, flowerShapeNoiseSeed) * leafShapeMask(x),
    (x: number) => pow(sin(PI * x), leafPointyness),
  ];
  const leafShape = randChoice(leafShapes);

  var flowerHue0 = (normRand(0, 180) - 130 + 360) % 360;
  var flowerHue1 = Math.floor((flowerHue0 + normRand(-70, 70) + 360) % 360);
  var flowerValue0 = Math.min(1, normRand(0.5, 1.3));
  var flowerValue1 = Math.min(1, normRand(0.5, 1.3));
  var flowerSaturation0 = normRand(0, 1.1 - flowerValue0);
  var flowerSaturation1 = normRand(0, 1.1 - flowerValue1);

  const flowerColor = {
    min: [flowerHue0, flowerSaturation0, flowerValue0, normRand(0.8, 1)],
    max: [flowerHue1, flowerSaturation1, flowerValue1, normRand(0.5, 1)],
  };
  const leafColor = {
    min: [
      normRand(10, 200),
      normRand(0.05, 0.4),
      normRand(0.3, 0.7),
      normRand(0.8, 1),
    ],
    max: [
      normRand(10, 200),
      normRand(0.05, 0.4),
      normRand(0.3, 0.7),
      normRand(0.8, 1),
    ],
  };

  var curveCoeff0 = [normRand(-0.5, 0.5), normRand(5, 10)];
  var curveCoeff1 = [sketch.random() * PI, normRand(1, 5)];

  var curveCoeff2 = [sketch.random() * PI, normRand(5, 15)];
  var curveCoeff3 = [sketch.random() * PI, normRand(1, 5)];
  var curveCoeff4 = [sketch.random() * 0.5, normRand(0.8, 1.2)];

  const flowerOpenCurves = [
    (x: number, op: number) =>
      x < 0.1 ? 2 + op * curveCoeff2[1] : sketch.noise(x * 10, curveCoeff2[0]),
    (x: number, op: number) =>
      x < curveCoeff4[0]
        ? 0
        : 10 - x * mapval(op, 0, 1, 16, 20) * curveCoeff4[1],
  ];
  const flowerOpenCurve = randChoice(flowerOpenCurves);

  const flowerColorCurve = randChoice([
    (x: number) => sigmoid(x + curveCoeff0[0], curveCoeff0[1]),
    //(x: number)=>(sketch.noise(x*curveCoeff1[1],curveCoeff1[0]))
  ]);
  const leafLength = normRand(30, 100);
  const flowerLength = normRand(5, 55); //* (0.1-flowerChance)*10
  const pedicelLength = normRand(5, 30);

  const leafWidth = normRand(5, 30);

  const flowerWidth = normRand(5, 30);

  const stemWidth = normRand(2, 11);
  const stemBend = normRand(2, 16);
  const stemLength = normRand(300, 400);
  const stemCount = randChoice([2, 3, 4, 5]);

  const sheathLength = randChoice([0, normRand(50, 100)]);
  const sheathWidth = normRand(5, 15);
  const shootCount = normRand(1, 7);
  const shootLength = normRand(50, 180);
  const leafPosition = randChoice([1, 2]);

  const flowerPetal = Math.round(mapval(flowerWidth, 5, 50, 10, 3));

  const innerLength = Math.min(normRand(0, 20), flowerLength * 0.8);
  const innerWidth = Math.min(
    randChoice([0, normRand(1, 8)]),
    flowerWidth * 0.8,
  );
  const innerShape = (x: number) => pow(sin(PI * x), 1);
  var innerHue = normRand(0, 60);
  const innerColor = {
    min: [innerHue, normRand(0.1, 0.7), normRand(0.5, 0.9), normRand(0.8, 1)],
    max: [innerHue, normRand(0.1, 0.7), normRand(0.5, 0.9), normRand(0.5, 1)],
  };

  const branchWidth = normRand(0.4, 1.3);
  const branchTwist = Math.round(normRand(2, 5));
  const branchDepth = randChoice([3, 4]);
  const branchFork = randChoice([4, 5, 6, 7]);

  var branchHue = normRand(30, 60);
  var branchSaturation = normRand(0.05, 0.3);
  var branchValue = normRand(0.7, 0.9);
  const branchColor = {
    min: [branchHue, branchSaturation, branchValue, 1],
    max: [branchHue, branchSaturation, branchValue, 1],
  };

  const parameters = {
    flowerChance,
    leafChance,
    leafType,
    flowerShape,
    leafShape,
    flowerColor,
    leafColor,
    flowerOpenCurve,
    flowerColorCurve,
    leafLength,
    flowerLength,
    pedicelLength,
    leafWidth,
    flowerWidth,
    stemWidth,
    stemBend,
    stemLength,
    stemCount,
    sheathLength,
    sheathWidth,
    shootCount,
    shootLength,
    leafPosition,
    flowerPetal,
    innerLength,
    innerWidth,
    innerShape,
    innerColor,
    branchWidth,
    branchTwist,
    branchDepth,
    branchFork,
    branchColor,
  };

  const settings: ManualSettings = {
    ...defaultSettings(),
    flowerChance,
    leafChance,
    leafLength,
    flowerLength,
    pedicelLength,
    leafWidth,
    flowerWidth,
    stemWidth,
    stemBend,
    stemLength,
    stemCount,
    sheathLength,
    sheathWidth,
    shootCount,
    shootLength,
    flowerPetal,
    innerLength,
    branchWidth,
    branchTwist,
    branchDepth,
    branchFork,
    // These two sampled fields were unused by the original painter.
    // Reflect its actual center width and effective shape noise in the controls.
    innerWidth: 4,
    leafPlacement: leafPosition === 1 ? "base" : "stem",
    leafVeinMode: leafType[0] === 1 ? "parallel" : "diagonal",
    leafVeinCount: leafType[1],
    leafVeinSpacing: leafType[2] ?? 3,
    leafShapeMode: leafShape === leafShapes[0] ? "noise" : "smooth",
    flowerOpeningMode:
      flowerOpenCurve === flowerOpenCurves[0] ? "noise" : "folded",
    flowerJaggedness,
    flowerNoiseSeed: flowerShapeNoiseSeed,
    leafJaggedness,
    leafNoiseSeed: flowerShapeNoiseSeed,
    leafPointiness: leafPointyness,
    openingNoiseSeed: curveCoeff2[0],
    openingAmount:
      flowerOpenCurve === flowerOpenCurves[0] ? curveCoeff2[1] : 10,
    openingThreshold:
      flowerOpenCurve === flowerOpenCurves[0] ? 0.1 : curveCoeff4[0],
    openingScale: curveCoeff4[1],
    flowerColorOffset: curveCoeff0[0],
    flowerColorSteepness: curveCoeff0[1],
  };
  for (const [name, range] of Object.entries({
    flower: flowerColor,
    leaf: leafColor,
    inner: innerColor,
    branch: branchColor,
  })) {
    for (const [bound, values] of Object.entries({
      Min: range.min,
      Max: range.max,
    })) {
      ["Hue", "Saturation", "Value", "Alpha"].forEach((channel, index) => {
        Object.assign(settings, { [name + channel + bound]: values[index] });
      });
    }
  }
  return { parameters, settings };
}

export type Parameters = ReturnType<typeof sampleParameters>["parameters"];
