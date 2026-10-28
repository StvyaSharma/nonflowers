// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
import type p5 from "p5";
import { PI, sin, abs, mapval } from "./math";
import { v3, grot } from "./vectors";
import { rgba, hsv, lerpHue } from "./colors";
import { createRandom } from "./random";
import type { ManualSettings } from "./settings";
import type { Drawing } from "./drawing";
import type {
  LeafOptions,
  StemOptions,
  BranchOptions,
  BranchSegment,
} from "./types";

export function createStructures(
  sketch: p5,
  drawing: Drawing,
  settings?: ManualSettings,
) {
  const { polygon, stroke, tubify } = drawing;
  const { normRand } = createRandom(sketch);
  // generate leaf-like structure
  function leaf(args: LeafOptions) {
    var ctx = args.ctx;
    var xof = args.xof != undefined ? args.xof : 0;
    var yof = args.yof != undefined ? args.yof : 0;
    var rot = args.rot != undefined ? args.rot : [PI / 2, 0, 0];
    var len = args.len != undefined ? args.len : 500;
    var seg = args.seg != undefined ? args.seg : (settings?.segments ?? 40);
    var wid =
      args.wid != undefined ? args.wid : (x: number) => sin(x * PI) * 20;
    var vei = args.vei != undefined ? args.vei : [1, 3];
    var flo = args.flo != undefined ? args.flo : false;
    var col =
      args.col != undefined
        ? args.col
        : { min: [90, 0.2, 0.3, 1], max: [90, 0.1, 0.9, 1] };
    var cof = args.cof != undefined ? args.cof : (x: number) => x;
    var ben =
      args.ben != undefined
        ? args.ben
        : (x: number) => [normRand(-10, 10), 0, normRand(-5, 5)];

    var disp = v3.zero;
    var crot = v3.zero;
    var P = [disp];
    var ROT = [crot];
    var L = [disp];
    var R = [disp];

    var orient = (v: number[]) => v3.roteuler(v, rot);

    for (var i = 0; i < seg; i++) {
      var p = i / (seg - 1);
      crot = v3.add(crot, v3.scale(ben(p), 1 / seg));
      disp = v3.add(disp, orient(v3.roteuler([0, 0, len / seg], crot)));
      var w = wid(p);
      var l = v3.add(disp, orient(v3.roteuler([-w, 0, 0], crot)));
      var r = v3.add(disp, orient(v3.roteuler([w, 0, 0], crot)));

      if (i > 0) {
        var v0 = v3.subtract(disp, L.at(-1)!);
        var v1 = v3.subtract(l, disp);
        var v2 = v3.cross(v0, v1);
        if (!flo) {
          var lt = mapval(abs(v3.ang(v2, [0, -1, 0])), 0, PI, 1, 0);
        } else {
          var lt = p * normRand(0.95, 1);
        }
        lt = cof(lt) || 0;

        var h = lerpHue(col.min[0], col.max[0], lt);
        var s = mapval(lt, 0, 1, col.min[1], col.max[1]);
        var v = mapval(lt, 0, 1, col.min[2], col.max[2]);
        var a = mapval(lt, 0, 1, col.min[3], col.max[3]);

        polygon({
          ctx: ctx,
          pts: [l, L.at(-1)!, P.at(-1)!, disp],
          xof: xof,
          yof: yof,
          fil: true,
          str: true,
          col: hsv(h, s, v, a),
        });
        polygon({
          ctx: ctx,
          pts: [r, R.at(-1)!, P.at(-1)!, disp],
          xof: xof,
          yof: yof,
          fil: true,
          str: true,
          col: hsv(h, s, v, a),
        });
      }
      P.push(disp);
      ROT.push(crot);
      L.push(l);
      R.push(r);
    }
    if (vei[0] == 1) {
      for (var i = 1; i < P.length; i++) {
        for (var j = 0; j < vei[1]; j++) {
          var p = j / vei[1];

          var p0 = v3.lerp(L[i - 1], P[i - 1], p);
          var p1 = v3.lerp(L[i], P[i], p);

          var q0 = v3.lerp(R[i - 1], P[i - 1], p);
          var q1 = v3.lerp(R[i], P[i], p);
          polygon({
            ctx: ctx,
            pts: [p0, p1],
            xof: xof,
            yof: yof,
            fil: false,
            col: hsv(0, 0, 0, normRand(0.4, 0.9)),
          });
          polygon({
            ctx: ctx,
            pts: [q0, q1],
            xof: xof,
            yof: yof,
            fil: false,
            col: hsv(0, 0, 0, normRand(0.4, 0.9)),
          });
        }
      }
      stroke({ ctx: ctx, pts: P, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.3) });
    } else if (vei[0] == 2) {
      for (var i = 1; i < P.length - vei[1]; i += vei[2]) {
        polygon({
          ctx: ctx,
          pts: [P[i], L[i + vei[1]]],
          xof: xof,
          yof: yof,
          fil: false,
          col: hsv(0, 0, 0, normRand(0.4, 0.9)),
        });
        polygon({
          ctx: ctx,
          pts: [P[i], R[i + vei[1]]],
          xof: xof,
          yof: yof,
          fil: false,
          col: hsv(0, 0, 0, normRand(0.4, 0.9)),
        });
      }
      stroke({ ctx: ctx, pts: P, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.3) });
    }

    stroke({
      ctx: ctx,
      pts: L,
      xof: xof,
      yof: yof,
      col: rgba(120, 100, 0, 0.3),
    });
    stroke({
      ctx: ctx,
      pts: R,
      xof: xof,
      yof: yof,
      col: rgba(120, 100, 0, 0.3),
    });
    return P;
  }

  // generate stem-like structure
  function stem(args: StemOptions) {
    var ctx = args.ctx;
    var xof = args.xof != undefined ? args.xof : 0;
    var yof = args.yof != undefined ? args.yof : 0;
    var rot = args.rot != undefined ? args.rot : [PI / 2, 0, 0];
    var len =
      args.len != undefined ? args.len : (settings?.branchLength ?? 400);
    var seg = args.seg != undefined ? args.seg : (settings?.segments ?? 40);
    var wid = args.wid != undefined ? args.wid : (x: number) => 6;
    var col =
      args.col != undefined
        ? args.col
        : { min: [250, 0.2, 0.4, 1], max: [250, 0.3, 0.6, 1] };
    var ben =
      args.ben != undefined
        ? args.ben
        : (x: number) => [normRand(-10, 10), 0, normRand(-5, 5)];

    var disp = v3.zero;
    var crot = v3.zero;
    var P = [disp];
    var ROT = [crot];

    var orient = (v: number[]) => v3.roteuler(v, rot);

    for (var i = 0; i < seg; i++) {
      var p = i / (seg - 1);
      crot = v3.add(crot, v3.scale(ben(p), 1 / seg));
      disp = v3.add(disp, orient(v3.roteuler([0, 0, len / seg], crot)));
      ROT.push(crot);
      P.push(disp);
    }
    var [L, R] = tubify({ pts: P, wid: wid });
    var wseg = 4;
    for (var i = 1; i < P.length; i++) {
      for (var j = 1; j < wseg; j++) {
        var m = (j - 1) / (wseg - 1);
        var n = j / (wseg - 1);
        var p = i / (P.length - 1);

        var p0 = v3.lerp(L[i - 1], R[i - 1], m);
        var p1 = v3.lerp(L[i], R[i], m);

        var p2 = v3.lerp(L[i - 1], R[i - 1], n);
        var p3 = v3.lerp(L[i], R[i], n);

        var lt = n / p;
        var h =
          lerpHue(col.min[0], col.max[0], lt) *
          mapval(sketch.noise(p * 10, m * 10, n * 10), 0, 1, 0.5, 1);
        var s =
          mapval(lt, 0, 1, col.max[1], col.min[1]) *
          mapval(sketch.noise(p * 10, m * 10, n * 10), 0, 1, 0.5, 1);
        var v =
          mapval(lt, 0, 1, col.min[2], col.max[2]) *
          mapval(sketch.noise(p * 10, m * 10, n * 10), 0, 1, 0.5, 1);
        var a = mapval(lt, 0, 1, col.min[3], col.max[3]);

        polygon({
          ctx: ctx,
          pts: [p0, p1, p3, p2],
          xof: xof,
          yof: yof,
          fil: true,
          str: true,
          col: hsv(h, s, v, a),
        });
      }
    }
    stroke({ ctx: ctx, pts: L, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.5) });
    stroke({ ctx: ctx, pts: R, xof: xof, yof: yof, col: rgba(0, 0, 0, 0.5) });
    return P;
  }

  // generate fractal-like branches
  function branch(args: BranchOptions): BranchSegment[] {
    var ctx = args.ctx;
    var xof = args.xof != undefined ? args.xof : 0;
    var yof = args.yof != undefined ? args.yof : 0;
    var rot = args.rot != undefined ? args.rot : [PI / 2, 0, 0];
    var len =
      args.len != undefined ? args.len : (settings?.branchLength ?? 400);
    var seg = args.seg != undefined ? args.seg : (settings?.segments ?? 40);
    var wid = args.wid != undefined ? args.wid : 1;
    var twi = args.twi != undefined ? args.twi : 5;
    var col =
      args.col != undefined
        ? args.col
        : { min: [50, 0.2, 0.8, 1], max: [50, 0.2, 0.8, 1] };
    var dep = args.dep != undefined ? args.dep : 3;
    var frk = args.frk != undefined ? args.frk : 4;

    var jnt: number[][] = [];
    for (var i = 0; i < twi; i++) {
      jnt.push([Math.floor(sketch.random() * seg), normRand(-1, 1)]);
    }

    function jntdist(x: number) {
      var m = seg;
      var j = 0;
      for (var i = 0; i < jnt.length; i++) {
        var n = Math.abs(x * seg - jnt[i][0]);
        if (n < m) {
          m = n;
          j = i;
        }
      }
      return [m, jnt[j][1]];
    }

    var wfun = function (x: number) {
      var [m, j] = jntdist(x);
      if (m < 1) {
        return wid * (3 + 5 * (1 - x));
      } else {
        return (
          wid * (2 + 7 * (1 - x) * mapval(sketch.noise(x * 10), 0, 1, 0.5, 1))
        );
      }
    };

    var bfun = function (x: number) {
      var [m, j] = jntdist(x);
      if (m < 1) {
        return [0, j * 20, 0];
      } else {
        return [0, normRand(-5, 5), 0];
      }
    };

    var P = stem({
      ctx: ctx,
      xof: xof,
      yof: yof,
      rot: rot,
      len: len,
      seg: seg,
      wid: wfun,
      col: col,
      ben: bfun,
    });

    var child: BranchSegment[] = [];
    if (dep > 0 && wid > 0.1) {
      for (var i = 0; i < frk * sketch.random(); i++) {
        var ind = Math.floor(normRand(1, P.length));

        var r = grot(P, ind);
        var L = branch({
          ctx: ctx,
          xof: xof + P[ind][0],
          yof: yof + P[ind][1],
          rot: [
            r[0] + (normRand(-1, 1) * PI) / 6,
            r[1] + (normRand(-1, 1) * PI) / 6,
            r[2] + (normRand(-1, 1) * PI) / 6,
          ],
          seg: seg,
          len: len * normRand(0.4, 0.6),
          wid: wid * normRand(0.4, 0.7),
          twi: twi * 0.7,
          dep: dep - 1,
          ...(settings ? { col, frk } : {}),
        });
        //child = child.concat(L.map((v)=>([v[0],[v[1][0]+P[ind][0],v[1][1]+P[ind][1],v[1][2]]])))
        child = child.concat(L);
      }
    }
    return [[dep, P.map((v) => [v[0] + xof, v[1] + yof, v[2]])], ...child];
  }
  return { leaf, stem, branch };
}
export type Structures = ReturnType<typeof createStructures>;
