/** One schema drives URL validation, seeded recipes and unmodified DialKit controls. */
export const regions = [
  "head",
  "dorsum",
  "flank",
  "belly",
  "tail",
  "dorsal",
  "anal",
  "pectoral",
  "pelvic",
] as const;
export type Region = (typeof regions)[number];
export const regionLabels: Record<Region, string> = {
  head: "Head",
  dorsum: "Back",
  flank: "Flank",
  belly: "Belly",
  tail: "Tail fin",
  dorsal: "Dorsal fin",
  anal: "Anal fin",
  pectoral: "Pectoral fin",
  pelvic: "Pelvic fin",
};
export const patterns = [
  "solid",
  "stripes",
  "bars",
  "spots",
  "reticulation",
  "marble",
  "ocelli",
  "turing",
] as const;
export type Pattern = (typeof patterns)[number];
export interface Metric {
  label: string;
  group: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}
const m = (
  label: string,
  group: string,
  min: number,
  max: number,
  step: number,
  initial: number,
): Metric => ({ label, group, min, max, step, initial });
const globalMetrics = {
  bodyLength: m("Body length", "Fish anatomy", 260, 380, 1, 340),
  bodyDepth: m("Body depth", "Fish anatomy", 65, 175, 1, 125),
  bodyBend: m("Body bend", "Fish anatomy", -30, 30, 1, 8),
  tailSize: m("Tail spread", "Fish anatomy", 35, 95, 1, 65),
  finSize: m("Fin reach", "Fish anatomy", 20, 95, 1, 55),
  eyeSize: m("Eye size", "Fish anatomy", 4, 12, 0.5, 7),
  patternScale: m("Pattern frequency", "Fish patterns", 2, 20, 0.25, 8),
  patternWarp: m("Pattern distortion", "Fish patterns", 0, 2, 0.05, 0.4),
  patternContrast: m("Pattern contrast", "Fish patterns", 0, 1, 0.01, 0.8),
  patternCoverage: m("Dark coverage", "Fish patterns", 0.05, 0.95, 0.01, 0.45),
  paleStrength: m("Pale marking strength", "Fish pale markings", 0, 1, 0.01, 0),
  paleScale: m(
    "Pale marking frequency",
    "Fish pale markings",
    0.25,
    3,
    0.05,
    1,
  ),
  palePhase: m("Pale marking phase", "Fish pale markings", 0, 1, 0.01, 0.25),
  paleBorder: m(
    "Pale marking dark edge",
    "Fish pale markings",
    0,
    1,
    0.01,
    0.4,
  ),
  patchScale: m("Warm patch frequency", "Fish pigments", 1, 10, 0.25, 3),
  patchCoverage: m(
    "Warm patch coverage",
    "Fish pigments",
    0.05,
    0.95,
    0.01,
    0.6,
  ),
  lightAngle: m("Reflection angle", "Fish pigments", -90, 90, 1, -25),
  sheenShift: m("Reflection hue travel", "Fish pigments", 0, 90, 1, 25),
  secondaryMix: m("Secondary pattern", "Fish patterns", 0, 1, 0.01, 0.15),
  countershading: m("Countershading", "Fish pigments", 0, 1, 0.01, 0.55),
  melanin: m("Melanin density", "Fish pigments", 0, 1, 0.01, 0.85),
  xanthophore: m("Yellow pigment", "Fish pigments", 0, 1, 0.01, 0.55),
  erythrophore: m("Red pigment", "Fish pigments", 0, 1, 0.01, 0.25),
  iridophore: m("Structural reflection", "Fish pigments", 0, 1, 0.01, 0.45),
  leucophore: m("White scattering", "Fish pigments", 0, 1, 0.01, 0.2),
  pigmentCompetition: m(
    "Pigment competition",
    "Fish interactions",
    0,
    1,
    0.01,
    0.6,
  ),
  regionBlend: m("Region blending", "Fish interactions", 0.01, 0.4, 0.01, 0.16),
  coupling: m("Boundary coupling", "Fish interactions", 0, 1, 0.01, 0.8),
  lateralCue: m("Lateral line cue", "Fish interactions", 0, 1, 0.01, 0.4),
  rayInfluence: m("Fin ray guidance", "Fish interactions", 0, 1, 0.01, 0.5),
  feed: m("Feed rate", "Reaction diffusion", 0.01, 0.08, 0.001, 0.035),
  kill: m("Removal rate", "Reaction diffusion", 0.035, 0.075, 0.001, 0.062),
  diffusionA: m(
    "Substrate diffusion",
    "Reaction diffusion",
    0.12,
    0.24,
    0.005,
    0.2,
  ),
  diffusionB: m(
    "Activator diffusion",
    "Reaction diffusion",
    0.04,
    0.12,
    0.005,
    0.09,
  ),
  anisotropy: m(
    "Diffusion direction",
    "Reaction diffusion",
    -0.8,
    0.8,
    0.05,
    0.3,
  ),
  iterations: m("Growth steps", "Reaction diffusion", 100, 1800, 50, 800),
  scaleSize: m("Scale spacing", "Fish surface", 4, 16, 1, 8),
  scaleOpacity: m("Scale visibility", "Fish surface", 0, 1, 0.01, 0.25),
  finOpacity: m("Fin opacity", "Fish surface", 0.15, 1, 0.01, 0.7),
  finRays: m("Fin rays", "Fish surface", 5, 24, 1, 13),
  rim: m("Pale fin margins", "Fish surface", 0, 1, 0.01, 0.35),
  brushOpacity: m("Watercolor glaze", "Fish brush", 0, 1, 0.01, 0.32),
  bleed: m("Watercolor bleed", "Fish brush", 0, 0.5, 0.01, 0.08),
  granulation: m("Granulation", "Fish brush", 0, 1, 0.01, 0.4),
  ink: m("Ink outlines", "Fish brush", 0, 1, 0.01, 0.65),
  paperGrain: m("Paper grain", "Fish brush", 0, 1, 0.01, 0.3),
};
const regionalMetrics = {
  strength: ["Pattern strength", 0, 1, 0.01, 1],
  scale: ["Frequency multiplier", 0.25, 3, 0.05, 1],
  phase: ["Phase offset", 0, 1, 0.01, 0],
  hue: ["Hue shift", -120, 120, 1, 0],
  melanin: ["Dark pigment", 0, 1.5, 0.05, 1],
  warm: ["Warm pigment", 0, 1.5, 0.05, 1],
  pale: ["Pale markings", 0, 1.5, 0.05, 1],
  reflect: ["Reflective cells", 0, 1.5, 0.05, 1],
  inherit: ["Shared field influence", 0, 1, 0.01, 0.75],
  reaction: ["Local reaction bias", -0.012, 0.012, 0.001, 0],
} as const;
export type RegionMetric = keyof typeof regionalMetrics;
export type RegionalKey = `${Region}_${RegionMetric}`;
export type FishSettings = {
  [K in keyof typeof globalMetrics]: number;
} & Record<RegionalKey, number> &
  Record<`${Region}_pattern`, Pattern | "shared"> & {
    palette: "river" | "reef" | "koi" | "silver" | "deepwater";
    pattern: Pattern;
    secondary: Pattern;
    palePattern: "bars" | "stripes" | "spots" | "ocelli";
    view:
      "painting" | "regions" | "melanin" | "warm" | "reflection" | "reaction";
    form: "fusiform" | "deep" | "longfin";
  };
export const fishMetrics: Record<
  keyof typeof globalMetrics | RegionalKey,
  Metric
> = { ...globalMetrics } as Record<
  keyof typeof globalMetrics | RegionalKey,
  Metric
>;
export const fishChoices: Record<
  string,
  { label: string; group: string; initial: string; options: readonly string[] }
> = {
  view: {
    label: "Layer view",
    group: "Fish surface",
    initial: "painting",
    options: [
      "painting",
      "regions",
      "melanin",
      "warm",
      "reflection",
      "reaction",
    ],
  },
  form: {
    label: "Body form",
    group: "Fish anatomy",
    initial: "fusiform",
    options: ["fusiform", "deep", "longfin"],
  },
  palette: {
    label: "Palette",
    group: "Fish pigments",
    initial: "river",
    options: ["river", "reef", "koi", "silver", "deepwater"],
  },
  pattern: {
    label: "Primary pattern",
    group: "Fish patterns",
    initial: "reticulation",
    options: patterns,
  },
  palePattern: {
    label: "Pale pattern",
    group: "Fish pale markings",
    initial: "bars",
    options: ["bars", "stripes", "spots", "ocelli"],
  },
  secondary: {
    label: "Overlay pattern",
    group: "Fish patterns",
    initial: "spots",
    options: patterns,
  },
};
for (const region of regions) {
  const group = `Fish region · ${regionLabels[region]}`;
  fishChoices[`${region}_pattern`] = {
    label: "Regional pattern",
    group,
    initial: "shared",
    options: ["shared", ...patterns],
  };
  for (const [key, [label, min, max, step, initial]] of Object.entries(
    regionalMetrics,
  ))
    fishMetrics[`${region}_${key as RegionMetric}`] = m(
      label,
      group,
      min,
      max,
      step,
      initial,
    );
}
export function defaultFishSettings(): FishSettings {
  const values: Record<string, number | string> = {};
  for (const [key, d] of Object.entries(fishMetrics)) values[key] = d.initial;
  for (const [key, d] of Object.entries(fishChoices)) values[key] = d.initial;
  return values as FishSettings;
}
export function readFishSettings(input: unknown): FishSettings {
  const values = defaultFishSettings();
  if (!input || typeof input !== "object") return values;
  const source = input as Record<string, unknown>;
  for (const [key, d] of Object.entries(fishMetrics)) {
    const v = source[key];
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    const bounded = Math.max(d.min, Math.min(d.max, v));
    Object.assign(values, {
      [key]: d.step >= 1 ? Math.round(bounded / d.step) * d.step : bounded,
    });
  }
  for (const [key, d] of Object.entries(fishChoices))
    if (typeof source[key] === "string" && d.options.includes(source[key]))
      Object.assign(values, { [key]: source[key] });
  return values;
}
