import { defaultFishSettings, patterns, type FishSettings } from "./settings";
export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return h >>> 0;
}
/** A local stream keeps pattern, paper and brush randomness independent. */
export function randomStream(seed: string): () => number {
  let h = hashSeed(seed);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function sampleFishSettings(seed: string): FishSettings {
  const r = randomStream(`${seed}:recipe`);
  const s = defaultFishSettings();
  s.pattern = patterns[Math.floor(r() * patterns.length)];
  s.palette = (["river", "reef", "koi", "silver", "deepwater"] as const)[
    Math.floor(r() * 5)
  ];
  s.form = (["fusiform", "deep", "longfin"] as const)[Math.floor(r() * 3)];
  s.bodyLength = Math.round(300 + r() * 70);
  s.bodyDepth = Math.round(85 + r() * 65);
  s.bodyBend = Math.round(-15 + r() * 30);
  s.patternScale = 5 + r() * 8;
  s.patternWarp = 0.15 + r() * 0.65;
  s.erythrophore = r() * 0.6;
  s.secondaryMix = r() * 0.3;
  s.tail_pattern = "bars";
  s.tail_hue = Math.round(-25 + r() * 50);
  s.dorsum_melanin = 1.2;
  s.belly_reflect = 1.4;
  return s;
}
