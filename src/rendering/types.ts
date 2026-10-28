export type ColorRange = { min: number[]; max: number[] };
export type Curve = (position: number) => number;
export type PixelFilter = (
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
) => number[];
export type BranchSegment = [depth: number, points: number[][]];
export interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  xof?: number;
  yof?: number;
}
export interface PolygonOptions extends DrawOptions {
  pts?: number[][];
  col?: string;
  fil?: boolean;
  str?: boolean;
}
export interface TubeOptions {
  pts?: number[][];
  wid?: Curve;
}
export interface StrokeOptions extends PolygonOptions {
  wid?: Curve;
}
export interface PaperOptions {
  col?: number[];
  tex?: number;
  spr?: number;
}
export interface StemOptions extends DrawOptions {
  rot?: number[];
  len?: number;
  seg?: number;
  wid?: Curve;
  col?: ColorRange;
  ben?: (position: number) => number[];
}
export interface LeafOptions extends StemOptions {
  vei?: number[];
  flo?: boolean;
  cof?: Curve;
}
export interface BranchOptions extends DrawOptions {
  rot?: number[];
  len?: number;
  seg?: number;
  wid?: number;
  twi?: number;
  col?: ColorRange;
  dep?: number;
  frk?: number;
}
export interface BlitOptions {
  ble?: "normal" | "multiply";
  xof?: number;
  yof?: number;
}
