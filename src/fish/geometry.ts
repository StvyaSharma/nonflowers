import type { FishSettings, Region } from "./settings";
export type Point = [number, number];
export interface Fin {
  region: Region;
  points: Point[];
  root: Point;
}
export interface FishGeometry {
  body: Point[];
  fins: Fin[];
  x0: number;
  length: number;
  depth: number;
  bend: number;
}
export function centerY(u: number, g: FishGeometry): number {
  return 300 + g.bend * Math.sin(u * Math.PI);
}
export function halfDepth(u: number, g: FishGeometry): number {
  return (
    ((g.depth *
      (0.11 + 0.89 * Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.78))) /
      2) *
    (1 - 0.38 * u)
  );
}
export function createFishGeometry(s: FishSettings): FishGeometry {
  const depth = Math.min(
    185,
    s.bodyDepth * (s.form === "deep" ? 1.2 : s.form === "longfin" ? 0.85 : 1),
  );
  const g: FishGeometry = {
    body: [],
    fins: [],
    x0: 75,
    length: s.bodyLength,
    depth,
    bend: s.bodyBend,
  };
  const at = (u: number, v: number): Point => [
    g.x0 + u * g.length,
    centerY(u, g) + halfDepth(u, g) * v,
  ];
  for (let i = 0; i <= 60; i++) g.body.push(at(i / 60, -1));
  for (let i = 60; i >= 0; i--) g.body.push(at(i / 60, 1));
  const reach = s.finSize * (s.form === "longfin" ? 1.35 : 1);
  const tailX = Math.min(565, g.x0 + g.length + 75);
  const end = at(0.98, 0);
  g.fins = [
    {
      region: "tail",
      root: end,
      points: [
        at(0.94, -0.8),
        [tailX, 300 - s.tailSize],
        [tailX - 15, 300],
        [tailX, 300 + s.tailSize],
        at(0.94, 0.8),
      ],
    },
    {
      region: "dorsal",
      root: at(0.5, -0.75),
      points: [
        at(0.26, -0.85),
        [at(0.42, -1)[0], at(0.42, -1)[1] - reach],
        [at(0.74, -1)[0], at(0.74, -1)[1] - reach * 0.35],
        at(0.86, -0.8),
      ],
    },
    {
      region: "anal",
      root: at(0.7, 0.8),
      points: [
        at(0.53, 0.85),
        [at(0.66, 1)[0], at(0.66, 1)[1] + reach * 0.8],
        at(0.89, 0.7),
      ],
    },
    {
      region: "pelvic",
      root: at(0.4, 0.8),
      points: [
        at(0.32, 0.7),
        [at(0.48, 1)[0], at(0.48, 1)[1] + reach * 0.65],
        at(0.48, 0.65),
      ],
    },
    {
      region: "pectoral",
      root: at(0.24, 0.1),
      points: [
        at(0.23, -0.1),
        [at(0.46, 0)[0], at(0.46, 0)[1] + reach * 0.7],
        at(0.44, 0.45),
        at(0.24, 0.5),
      ],
    },
  ];
  return g;
}
export function insidePolygon(x: number, y: number, points: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i],
      [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}
export function bodyCoordinates(x: number, y: number, g: FishGeometry): Point {
  const u = Math.max(0, Math.min(1, (x - g.x0) / g.length));
  return [u, (y - centerY(u, g)) / halfDepth(u, g)];
}
export function regionAt(
  x: number,
  y: number,
  g: FishGeometry,
): Region | undefined {
  const pectoral = g.fins.find((f) => f.region === "pectoral");
  if (pectoral && insidePolygon(x, y, pectoral.points)) return "pectoral";
  if (insidePolygon(x, y, g.body)) {
    const [u, v] = bodyCoordinates(x, y, g);
    return u < 0.22
      ? "head"
      : v < -0.45
        ? "dorsum"
        : v > 0.5
          ? "belly"
          : "flank";
  }
  return g.fins.find(
    (f) => f.region !== "pectoral" && insidePolygon(x, y, f.points),
  )?.region;
}
export function polygonPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
): void {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
}
