// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
export const { PI, sin, cos, abs, pow } = Math;
// distance between 2 coordinates in 2D
export function distance(p0: number[], p1: number[]) {
  return Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2));
}
// map float from one range to another
export function mapval(
  value: number,
  istart: number,
  istop: number,
  ostart: number,
  ostop: number,
) {
  return (
    ostart + (ostop - ostart) * (((value - istart) * 1.0) / (istop - istart))
  );
}
// sigmoid curve
export function sigmoid(x: number, k = 10) {
  k = k != undefined ? k : 10;
  return 1 / (1 + Math.exp(-k * (x - 0.5)));
}
// interpolate between square and circle
export const squircle = function (r: number, a: number) {
  return function (th: number) {
    while (th > PI / 2) {
      th -= PI / 2;
    }
    while (th < 0) {
      th += PI / 2;
    }
    return r * pow(1 / (pow(cos(th), a) + pow(sin(th), a)), 1 / a);
  };
};
