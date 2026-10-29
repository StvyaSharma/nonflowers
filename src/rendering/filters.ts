// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
import type p5 from "p5";
import { mapval } from "./math";
export function createFilters(sketch: p5) {
  // collection of image filters
  return {
    wispy(x: number, y: number, r: number, g: number, b: number, a: number) {
      var n = sketch.noise(x * 0.2, y * 0.2);
      var m = sketch.noise(x * 0.5, y * 0.5, 2);
      return [
        r,
        g * mapval(m, 0, 1, 0.95, 1),
        b * mapval(m, 0, 1, 0.9, 1),
        a * mapval(n, 0, 1, 0.5, 1),
      ];
    },
    fade(x: number, y: number, r: number, g: number, b: number, a: number) {
      var n = sketch.noise(x * 0.01, y * 0.01);
      return [r, g, b, a * Math.min(Math.max(mapval(n, 0, 1, 0, 1), 0), 1)];
    },
  };
}
