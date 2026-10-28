import type p5 from "p5";
import { mapval } from "./math";
export function createRandom(sketch: p5) {
  // random element from array
  function randChoice<T>(arr: T[]): T {
    return arr[Math.floor(arr.length * sketch.random())];
  }
  // normalized random number
  function normRand(m: number, M: number) {
    return mapval(sketch.random(), 0, 1, m, M);
  }
  return { randChoice, normRand };
}

/** Hash arbitrary text into the numeric seed expected by p5. */
export function seedSketch(sketch: p5, seed: string): void {
  let hash = 2166136261;
  for (const character of seed)
    hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619);
  sketch.randomSeed(hash >>> 0);
  sketch.noiseSeed(hash >>> 0);
}
