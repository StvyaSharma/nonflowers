// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
import { PI } from "./math";
// tools for vectors in 3d
export const v3 = {
  forward: [0, 0, 1],
  up: [0, 1, 0],
  right: [1, 0, 0],
  zero: [0, 0, 0],

  rotvec(vec: number[], axis: number[], th: number): number[] {
    var [l, m, n] = axis;
    var [x, y, z] = vec;
    var [costh, sinth] = [Math.cos(th), Math.sin(th)];
    var mat: Record<number, number> = {};
    mat[11] = l * l * (1 - costh) + costh;
    mat[12] = m * l * (1 - costh) - n * sinth;
    mat[13] = n * l * (1 - costh) + m * sinth;

    mat[21] = l * m * (1 - costh) + n * sinth;
    mat[22] = m * m * (1 - costh) + costh;
    mat[23] = n * m * (1 - costh) - l * sinth;

    mat[31] = l * n * (1 - costh) - m * sinth;
    mat[32] = m * n * (1 - costh) + l * sinth;
    mat[33] = n * n * (1 - costh) + costh;
    return [
      x * mat[11] + y * mat[12] + z * mat[13],
      x * mat[21] + y * mat[22] + z * mat[23],
      x * mat[31] + y * mat[32] + z * mat[33],
    ];
  },
  roteuler(vec: number[], rot: number[]): number[] {
    if (rot[2] != 0) {
      vec = v3.rotvec(vec, v3.forward, rot[2]);
    }
    if (rot[0] != 0) {
      vec = v3.rotvec(vec, v3.right, rot[0]);
    }
    if (rot[1] != 0) {
      vec = v3.rotvec(vec, v3.up, rot[1]);
    }
    return vec;
  },

  scale(vec: number[], p: number) {
    return [vec[0] * p, vec[1] * p, vec[2] * p];
  },
  copy(v0: number[]) {
    return [v0[0], v0[1], v0[2]];
  },
  add(v0: number[], v: number[]) {
    return [v0[0] + v[0], v0[1] + v[1], v0[2] + v[2]];
  },
  subtract(v0: number[], v: number[]) {
    return [v0[0] - v[0], v0[1] - v[1], v0[2] - v[2]];
  },
  mag(v: number[]) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  },
  normalize(v: number[]) {
    const p = 1 / v3.mag(v);
    return [v[0] * p, v[1] * p, v[2] * p];
  },
  dot(u: number[], v: number[]) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  },
  cross(u: number[], v: number[]) {
    return [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
  },
  angcos(u: number[], v: number[]): number {
    return v3.dot(u, v) / (v3.mag(u) * v3.mag(v));
  },
  ang(u: number[], v: number[]): number {
    return Math.acos(v3.angcos(u, v));
  },
  toeuler(v0: number[]): number[] {
    var ep = 5;
    var ma = 2 * PI;
    var mr = [0, 0, 0];
    var cnt = 0;
    for (var x = -180; x < 180; x += ep) {
      for (var y = -90; y < 90; y += ep) {
        cnt++;
        var r = [(x * Math.PI) / 180, (y * Math.PI) / 180, 0];
        var v = v3.roteuler([0, 0, 1], r);
        var a = v3.ang(v0, v);
        if (a < (ep * Math.PI) / 180) {
          return r;
        }
        if (a < ma) {
          ma = a;
          mr = r;
        }
      }
    }
    return mr;
  },
  lerp(u: number[], v: number[], p: number) {
    return [
      u[0] * (1 - p) + v[0] * p,
      u[1] * (1 - p) + v[1] * p,
      u[2] * (1 - p) + v[2] * p,
    ];
  },
};
// get rotation at given index of a poly-line
export function grot(P: number[][], ind: number) {
  var d = v3.subtract(P.at(ind)!, P.at(ind - 1)!);
  return v3.toeuler(d);
}
