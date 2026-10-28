// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
import { abs, mapval } from "./math";
// rgba to css color string
export function rgba(r = 255, g = r, b = g, a = 1) {
  r = r != undefined ? r : 255;
  g = g != undefined ? g : r;
  b = b != undefined ? b : g;
  a = a != undefined ? a : 1.0;
  return (
    "rgba(" +
    Math.floor(r) +
    "," +
    Math.floor(g) +
    "," +
    Math.floor(b) +
    "," +
    a.toFixed(3) +
    ")"
  );
}
// hsv to css color string
export function hsv(h: number, s: number, v: number, a = 1) {
  // Higher manual noise falloff can push shading beyond a single hue rotation.
  if (h < 0 || h >= 360) h = ((h % 360) + 360) % 360;
  var c = v * s;
  var x = c * (1 - abs(((h / 60) % 2) - 1));
  var m = v - c;
  var [rv, gv, bv] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(h / 60)];
  var [r, g, b] = [(rv + m) * 255, (gv + m) * 255, (bv + m) * 255];
  return rgba(r, g, b, a);
}
// lerp hue wrapping around 360 degs
export function lerpHue(h0: number, h1: number, p: number) {
  var methods = [
    [abs(h1 - h0), mapval(p, 0, 1, h0, h1)],
    [abs(h1 + 360 - h0), mapval(p, 0, 1, h0, h1 + 360)],
    [abs(h1 - 360 - h0), mapval(p, 0, 1, h0, h1 - 360)],
  ];
  methods.sort((x, y) => x[0] - y[0]);
  return (methods[0][1] + 720) % 360;
}
