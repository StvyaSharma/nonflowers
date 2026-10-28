import type { FishSettings, Region } from "./settings";
import { clamp, patternValue, regionalPattern, smooth } from "./patterns";
import type { PatternField } from "./reaction";
type RGB = [number, number, number];
interface Palette {
  ground: RGB;
  dark: RGB;
  yellow: RGB;
  red: RGB;
  reflective: RGB;
}
export const palettes: Record<FishSettings["palette"], Palette> = {
  river: {
    ground: [172, 179, 132],
    dark: [33, 53, 46],
    yellow: [221, 180, 64],
    red: [190, 89, 53],
    reflective: [149, 202, 190],
  },
  reef: {
    ground: [72, 169, 180],
    dark: [19, 38, 74],
    yellow: [250, 209, 67],
    red: [228, 95, 75],
    reflective: [122, 202, 231],
  },
  koi: {
    ground: [237, 221, 188],
    dark: [40, 43, 43],
    yellow: [234, 185, 72],
    red: [211, 65, 39],
    reflective: [233, 227, 208],
  },
  silver: {
    ground: [181, 195, 193],
    dark: [36, 57, 69],
    yellow: [210, 203, 151],
    red: [173, 117, 103],
    reflective: [207, 229, 236],
  },
  deepwater: {
    ground: [130, 76, 89],
    dark: [35, 27, 45],
    yellow: [199, 132, 66],
    red: [204, 63, 69],
    reflective: [133, 134, 192],
  },
};
const mix = (a: RGB, b: RGB, t: number): RGB =>
  a.map((v, i) => v * (1 - clamp(t)) + b[i] * clamp(t)) as RGB;
function hueShift(rgb: RGB, angle: number): RGB {
  // Rodrigues rotation around the neutral RGB axis; clipped only at output.
  const t = (angle * Math.PI) / 180,
    c = Math.cos(t),
    ss = Math.sin(t),
    mean = (rgb[0] + rgb[1] + rgb[2]) / 3;
  return rgb.map(
    (v, i) =>
      v * c +
      mean * (1 - c) +
      ((rgb[(i + 2) % 3] - rgb[(i + 1) % 3]) * ss) / Math.sqrt(3),
  ) as RGB;
}
export interface PigmentSample {
  color: RGB;
  dark: number;
  reflection: number;
  warm: number;
}
/** Ordered artistic layers: warm ground -> pigment competition -> melanin -> reflection.
 * No claim of spectral optics or a quantitative chromatophore population simulation.
 */
export function pigmentAt(
  region: Region,
  u: number,
  v: number,
  x: number,
  y: number,
  s: FishSettings,
  field: PatternField | undefined,
  seedPhase: number,
): PigmentSample {
  const p = palettes[s.palette],
    pattern = regionalPattern(region, u, v, x, y, s, field, seedPhase);
  let dark = clamp(
    pattern * s.patternContrast * s.melanin * s[`${region}_melanin`],
  );
  const pale = patternValue(
    s.palePattern,
    u,
    v,
    s,
    undefined,
    x,
    y,
    s.paleScale,
    s.palePhase,
    seedPhase,
  );
  const paleAmount = clamp(pale * s.paleStrength * s[`${region}_pale`]);
  dark *= 1 - paleAmount;
  const warm =
    clamp(s[`${region}_warm`] * (1 - dark * s.pigmentCompetition)) *
    (1 - paleAmount);
  const patches = smooth(
    1 - s.patchCoverage - 0.15,
    1 - s.patchCoverage + 0.15,
    0.5 +
      0.25 * Math.sin(u * s.patchScale * 6 + Math.sin(v * 4) + seedPhase * 6) +
      0.25 * Math.cos(v * s.patchScale * 2 + u * 5),
  );
  let color = mix(p.ground, p.yellow, s.xanthophore * warm * 0.65);
  color = mix(color, p.red, s.erythrophore * warm * patches * 0.7);
  color = hueShift(color, s[`${region}_hue`]);
  const shade = s.countershading * clamp((1 - v) / 2);
  color = mix(color, p.dark, shade * 0.45);
  color = mix(
    color,
    [246, 237, 206],
    s.countershading * smooth(-0.1, 1, v) * 0.65,
  );
  color = mix(color, p.dark, dark);
  const reflection = clamp(
    s.iridophore * s[`${region}_reflect`] * (1 - dark * s.pigmentCompetition),
  );
  color = mix(
    color,
    hueShift(
      p.reflective,
      Math.sin(v * 1.4 - (s.lightAngle * Math.PI) / 180) * s.sheenShift,
    ),
    reflection *
      (0.2 +
        0.65 *
          Math.pow(
            Math.max(0, Math.cos(v * 1.4 - (s.lightAngle * Math.PI) / 180)),
            4,
          )),
  );
  // Independent pale pattern: reflective/white bars can cross dark markings.
  const paleEdge =
    (1 - Math.abs(pale - 0.5) * 2) *
    s.paleBorder *
    s.paleStrength *
    s[`${region}_pale`];
  color = mix(color, p.dark, paleEdge * 0.6);
  color = mix(
    color,
    [248, 242, 221],
    clamp(s.leucophore * (1 - pattern) * 0.65 + paleAmount),
  );
  // Ocellus centers are warm, with a pale halo sharing the dark ring geometry.
  const motif =
    s[`${region}_pattern`] === "shared" ? s.pattern : s[`${region}_pattern`];
  if (motif === "ocelli") {
    const center = patternValue(
      "spots",
      u,
      v,
      { ...s, patternCoverage: 0.18 },
      undefined,
      x,
      y,
      s[`${region}_scale`],
      s[`${region}_phase`],
      seedPhase,
    );
    color = mix(color, p.yellow, center * s[`${region}_strength`] * 0.8);
  }
  return {
    color: color.map((c) => Math.round(Math.max(0, Math.min(255, c)))) as RGB,
    dark,
    reflection,
    warm,
  };
}
export function bodyPigment(
  u: number,
  v: number,
  x: number,
  y: number,
  s: FishSettings,
  field: PatternField | undefined,
  seedPhase: number,
): PigmentSample {
  const head = 1 - smooth(0.22 - s.regionBlend, 0.22 + s.regionBlend, u);
  const back =
    (1 - head) * (1 - smooth(-0.45 - s.regionBlend, -0.45 + s.regionBlend, v));
  const belly =
    (1 - head) * smooth(0.5 - s.regionBlend, 0.5 + s.regionBlend, v);
  const weights: [Region, number][] = [
    ["head", head],
    ["dorsum", back],
    ["belly", belly],
    ["flank", Math.max(0, 1 - head - back - belly)],
  ];
  const color: RGB = [0, 0, 0];
  let dark = 0,
    reflection = 0,
    warm = 0;
  for (const [region, weight] of weights)
    if (weight > 0) {
      const p = pigmentAt(region, u, v, x, y, s, field, seedPhase);
      for (let i = 0; i < 3; i++) color[i] += p.color[i] * weight;
      dark += p.dark * weight;
      reflection += p.reflection * weight;
      warm += p.warm * weight;
    }
  return { color, dark, reflection, warm };
}
