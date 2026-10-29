/** Serializable controls. This schema is shared by the renderer and DialKit UI. */
interface MetricDefinition {
  label: string;
  group: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}
function metric(
  label: string,
  group: string,
  min: number,
  max: number,
  step: number,
  initial: number,
): MetricDefinition {
  return { label, group, min, max, step, initial };
}

export const metrics = {
  flowerChance: metric("Flower probability", "Flowers", 0, 1, 0.001, 0.04),
  flowerLength: metric("Flower length", "Flowers", 0, 100, 1, 30),
  flowerWidth: metric("Flower width", "Flowers", 0, 80, 1, 18),
  flowerPetal: metric("Petals", "Flowers", 1, 20, 1, 8),
  pedicelLength: metric("Pedicel length", "Flowers", 0, 80, 1, 15),
  leafChance: metric("Leaf probability", "Leaves", 0, 1, 0.001, 0.05),
  leafLength: metric("Leaf length", "Leaves", 0, 200, 1, 65),
  leafWidth: metric("Leaf width", "Leaves", 0, 100, 1, 18),
  leafVeinCount: metric("Vein count / diagonal reach", "Leaves", 1, 12, 1, 3),
  leafVeinSpacing: metric("Diagonal vein spacing", "Leaves", 1, 12, 1, 3),
  stemLength: metric("Stem length", "Stems", 10, 600, 1, 350),
  stemWidth: metric("Stem width", "Stems", 0.1, 25, 0.1, 6),
  stemBend: metric("Stem bend", "Stems", 0, 40, 0.1, 8),
  stemCount: metric("Stem count", "Stems", 1, 8, 1, 3),
  sheathLength: metric("Sheath length", "Stems", 0, 160, 1, 60),
  sheathWidth: metric("Sheath width", "Stems", 0, 40, 0.1, 10),
  shootCount: metric("Shoot count", "Stems", 0, 10, 1, 3),
  shootLength: metric("Shoot length", "Stems", 1, 300, 1, 100),
  branchLength: metric("Branch length", "Branches", 10, 600, 1, 400),
  branchWidth: metric("Branch width", "Branches", 0.1, 3, 0.05, 0.8),
  branchTwist: metric("Branch joints", "Branches", 1, 8, 1, 3),
  branchDepth: metric("Branch depth", "Branches", 0, 4, 1, 3),
  branchFork: metric("Maximum branch forks", "Branches", 0, 7, 1, 4),
  flowerJaggedness: metric(
    "Flower jaggedness",
    "Shape curves",
    0.1,
    20,
    0.1,
    4,
  ),
  flowerNoiseSeed: metric(
    "Flower shape noise offset",
    "Shape curves",
    0,
    20,
    0.01,
    1,
  ),
  flowerMaskPower: metric(
    "Flower shape taper",
    "Shape curves",
    0.05,
    4,
    0.05,
    0.2,
  ),
  leafMaskPower: metric("Leaf noise taper", "Shape curves", 0.05, 4, 0.05, 0.5),
  leafJaggedness: metric("Leaf jaggedness", "Shape curves", 0.1, 60, 0.1, 10),
  leafNoiseSeed: metric(
    "Leaf shape noise offset",
    "Shape curves",
    0,
    20,
    0.01,
    1,
  ),
  leafPointiness: metric("Leaf pointiness", "Shape curves", 0.1, 4, 0.05, 1),
  openingNoiseSeed: metric(
    "Opening noise offset",
    "Shape curves",
    0,
    20,
    0.01,
    1,
  ),
  openingAmount: metric("Opening amount", "Shape curves", 0, 30, 0.1, 10),
  openingThreshold: metric(
    "Opening threshold",
    "Shape curves",
    0,
    0.9,
    0.01,
    0.2,
  ),
  openingScale: metric("Opening scale", "Shape curves", 0.1, 3, 0.01, 1),
  flowerColorOffset: metric(
    "Flower color curve offset",
    "Shape curves",
    -1,
    1,
    0.01,
    0,
  ),
  flowerColorSteepness: metric(
    "Flower color curve steepness",
    "Shape curves",
    0.1,
    20,
    0.1,
    7,
  ),
  innerLength: metric("Center length", "Flower centers", 0, 60, 1, 10),
  innerWidth: metric("Center width", "Flower centers", 0, 20, 0.1, 4),
  innerShapePower: metric(
    "Center shape taper",
    "Flower centers",
    0.1,
    4,
    0.1,
    1,
  ),
  segments: metric("Geometry segments", "Paper and rendering", 8, 60, 1, 40),
  borderRadius: metric(
    "Border radius",
    "Paper and rendering",
    0.5,
    1,
    0.01,
    0.98,
  ),
  borderPower: metric("Border shape", "Paper and rendering", 1, 8, 0.1, 3),
  noiseOctaves: metric("Noise octaves", "Paper and rendering", 1, 8, 1, 4),
  noiseFalloff: metric(
    "Noise falloff",
    "Paper and rendering",
    0.1,
    0.8,
    0.01,
    0.5,
  ),
  paperTexture: metric("Paper texture", "Paper and rendering", 0, 50, 1, 20),
  paperSpeckles: metric("Paper speckles", "Paper and rendering", 0, 3, 0.1, 1),
  backgroundTexture: metric(
    "Background texture",
    "Paper and rendering",
    0,
    50,
    1,
    10,
  ),
  backgroundSpeckles: metric(
    "Background speckles",
    "Paper and rendering",
    0,
    3,
    0.1,
    0,
  ),
  flowerHueMin: metric("Min hue", "Flower colors", 0, 359, 1, 50),
  flowerSaturationMin: metric(
    "Min saturation",
    "Flower colors",
    0,
    1,
    0.01,
    0.3,
  ),
  flowerValueMin: metric("Min brightness", "Flower colors", 0, 1, 0.01, 0.7),
  flowerAlphaMin: metric("Min opacity", "Flower colors", 0, 1, 0.01, 1),
  flowerHueMax: metric("Max hue", "Flower colors", 0, 359, 1, 50),
  flowerSaturationMax: metric(
    "Max saturation",
    "Flower colors",
    0,
    1,
    0.01,
    0.3,
  ),
  flowerValueMax: metric("Max brightness", "Flower colors", 0, 1, 0.01, 0.7),
  flowerAlphaMax: metric("Max opacity", "Flower colors", 0, 1, 0.01, 1),
  leafHueMin: metric("Min hue", "Leaf colors", 0, 359, 1, 50),
  leafSaturationMin: metric("Min saturation", "Leaf colors", 0, 1, 0.01, 0.3),
  leafValueMin: metric("Min brightness", "Leaf colors", 0, 1, 0.01, 0.7),
  leafAlphaMin: metric("Min opacity", "Leaf colors", 0, 1, 0.01, 1),
  leafHueMax: metric("Max hue", "Leaf colors", 0, 359, 1, 50),
  leafSaturationMax: metric("Max saturation", "Leaf colors", 0, 1, 0.01, 0.3),
  leafValueMax: metric("Max brightness", "Leaf colors", 0, 1, 0.01, 0.7),
  leafAlphaMax: metric("Max opacity", "Leaf colors", 0, 1, 0.01, 1),
  innerHueMin: metric("Min hue", "Center colors", 0, 359, 1, 50),
  innerSaturationMin: metric(
    "Min saturation",
    "Center colors",
    0,
    1,
    0.01,
    0.3,
  ),
  innerValueMin: metric("Min brightness", "Center colors", 0, 1, 0.01, 0.7),
  innerAlphaMin: metric("Min opacity", "Center colors", 0, 1, 0.01, 1),
  innerHueMax: metric("Max hue", "Center colors", 0, 359, 1, 50),
  innerSaturationMax: metric(
    "Max saturation",
    "Center colors",
    0,
    1,
    0.01,
    0.3,
  ),
  innerValueMax: metric("Max brightness", "Center colors", 0, 1, 0.01, 0.7),
  innerAlphaMax: metric("Max opacity", "Center colors", 0, 1, 0.01, 1),
  branchHueMin: metric("Min hue", "Branch colors", 0, 359, 1, 50),
  branchSaturationMin: metric(
    "Min saturation",
    "Branch colors",
    0,
    1,
    0.01,
    0.3,
  ),
  branchValueMin: metric("Min brightness", "Branch colors", 0, 1, 0.01, 0.7),
  branchAlphaMin: metric("Min opacity", "Branch colors", 0, 1, 0.01, 1),
  branchHueMax: metric("Max hue", "Branch colors", 0, 359, 1, 50),
  branchSaturationMax: metric(
    "Max saturation",
    "Branch colors",
    0,
    1,
    0.01,
    0.3,
  ),
  branchValueMax: metric("Max brightness", "Branch colors", 0, 1, 0.01, 0.7),
  branchAlphaMax: metric("Max opacity", "Branch colors", 0, 1, 0.01, 1),
  paperRed: metric("Paper red", "Paper colors", 0, 1, 0.01, 0.98),
  paperGreen: metric("Paper green", "Paper colors", 0, 1, 0.01, 0.91),
  paperBlue: metric("Paper blue", "Paper colors", 0, 1, 0.01, 0.74),
  backgroundRed: metric("Background red", "Paper colors", 0, 1, 0.01, 1),
  backgroundGreen: metric("Background green", "Paper colors", 0, 1, 0.01, 0.99),
  backgroundBlue: metric("Background blue", "Paper colors", 0, 1, 0.01, 0.9),
} satisfies Record<string, MetricDefinition>;

export const choices = {
  plantType: {
    label: "Plant type",
    group: "Plant",
    initial: "woody",
    options: ["woody", "herbal"],
  },
  leafShapeMode: {
    label: "Leaf shape",
    group: "Shape curves",
    initial: "noise",
    options: ["noise", "smooth"],
  },
  flowerOpeningMode: {
    label: "Flower opening",
    group: "Shape curves",
    initial: "noise",
    options: ["noise", "folded"],
  },
  leafVeinMode: {
    label: "Leaf veins",
    group: "Leaves",
    initial: "parallel",
    options: ["none", "parallel", "diagonal"],
  },
  leafPlacement: {
    label: "Leaf placement",
    group: "Leaves",
    initial: "stem",
    options: ["base", "stem"],
  },
} as const;
export type MetricKey = keyof typeof metrics;
export type ChoiceKey = keyof typeof choices;
export type ManualSettings = { [K in MetricKey]: number } & {
  [K in ChoiceKey]: (typeof choices)[K]["options"][number];
};

export function defaultSettings(): ManualSettings {
  const values: Record<string, number | string> = {};
  for (const [key, definition] of Object.entries(metrics))
    values[key] = definition.initial;
  for (const [key, definition] of Object.entries(choices))
    values[key] = definition.initial;
  return values as ManualSettings;
}

/** Only accept declared, finite values; imported URLs cannot bypass control ranges. */
export function readSettings(
  input: unknown,
  fallback = defaultSettings(),
): ManualSettings {
  const values = { ...fallback };
  if (!input || typeof input !== "object") return values;
  const source = input as Record<string, unknown>;
  for (const key of Object.keys(metrics) as MetricKey[]) {
    const value = source[key];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    const { min, max, step } = metrics[key];
    const bounded = Math.max(min, Math.min(max, value));
    values[key] = step === 1 ? Math.round(bounded) : bounded;
  }
  for (const key of Object.keys(choices) as ChoiceKey[]) {
    const value = source[key];
    if (
      typeof value === "string" &&
      (choices[key].options as readonly string[]).includes(value)
    ) {
      Object.assign(values, { [key]: value });
    }
  }
  return values;
}
