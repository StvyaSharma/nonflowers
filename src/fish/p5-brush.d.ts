/** Narrow declarations for the public p5.brush 3.0 standalone APIs used here.
 * Upstream ships JavaScript without declarations; no private API is accessed.
 */
declare module "p5.brush/standalone" {
  export function createCanvas(
    width: number,
    height: number,
    options?: { parent?: Element | null; pixelDensity?: number },
  ): HTMLCanvasElement;
  export function load(canvas: HTMLCanvasElement): void;
  export function clear(): void;
  export function render(): void;
  export function seed(seed: number): void;
  export function noiseSeed(seed: number): void;
  export function scaleBrushes(scale: number): void;
  export function noField(): void;
  export function noHatch(): void;
  export function noWash(): void;
  export function noStroke(): void;
  export function noFill(): void;
  export function fill(color: string, opacity: number): void;
  export function fillBleed(
    strength: number,
    direction?: string,
    angle?: number,
  ): void;
  export function fillTexture(
    strength: number,
    border: number,
    scatter?: boolean,
    split?: number,
  ): void;
  export function polygon(
    points: readonly (readonly [number, number])[],
  ): unknown;
  export function set(brush: string, color: string, weight: number): void;
  export function line(x1: number, y1: number, x2: number, y2: number): void;
}
