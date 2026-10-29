// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
import type p5 from "p5";
import { PI, sin, cos, mapval } from "./math";
import { rgba } from "./colors";
import type { Layers } from "./layers";
import type {
  PolygonOptions,
  TubeOptions,
  StrokeOptions,
  PaperOptions,
} from "./types";
export function createDrawing(sketch: p5, Layer: Layers) {
  // polygon for HTML canvas
  function polygon(args: PolygonOptions) {
    var ctx = args.ctx;
    var xof = args.xof != undefined ? args.xof : 0;
    var yof = args.yof != undefined ? args.yof : 0;
    var pts = args.pts != undefined ? args.pts : [];
    var col = args.col != undefined ? args.col : "black";
    var fil = args.fil != undefined ? args.fil : true;
    var str = args.str != undefined ? args.str : !fil;

    const graphics = Layer.graphics(ctx);
    graphics.push();
    if (fil) graphics.fill(col);
    else graphics.noFill();
    if (str) graphics.stroke(col);
    else graphics.noStroke();
    graphics.beginShape();
    for (const point of pts) graphics.vertex(point[0] + xof, point[1] + yof);
    graphics.endShape();
    graphics.pop();
  }
  // generate 2d tube shape from list of points
  function tubify(args: TubeOptions = {}) {
    var pts = args.pts != undefined ? args.pts : [];
    var wid = args.wid != undefined ? args.wid : (x: number) => 10;
    var vtxlist0: number[][] = [];
    var vtxlist1: number[][] = [];
    for (var i = 1; i < pts.length - 1; i++) {
      var w = wid(i / pts.length);
      var a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
      var a2 = Math.atan2(pts[i][1] - pts[i + 1][1], pts[i][0] - pts[i + 1][0]);
      var a = (a1 + a2) / 2;
      if (a < a2) {
        a += PI;
      }
      vtxlist0.push([pts[i][0] + w * cos(a), pts[i][1] + w * sin(a)]);
      vtxlist1.push([pts[i][0] - w * cos(a), pts[i][1] - w * sin(a)]);
    }
    var l = pts.length - 1;
    var a0 =
      Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]) - Math.PI / 2;
    var a1 =
      Math.atan2(pts[l][1] - pts[l - 1][1], pts[l][0] - pts[l - 1][0]) -
      Math.PI / 2;
    var w0 = wid(0);
    var w1 = wid(1);
    vtxlist0.unshift([
      pts[0][0] + w0 * Math.cos(a0),
      pts[0][1] + w0 * Math.sin(a0),
    ]);
    vtxlist1.unshift([
      pts[0][0] - w0 * Math.cos(a0),
      pts[0][1] - w0 * Math.sin(a0),
    ]);
    vtxlist0.push([
      pts[l][0] + w1 * Math.cos(a1),
      pts[l][1] + w1 * Math.sin(a1),
    ]);
    vtxlist1.push([
      pts[l][0] - w1 * Math.cos(a1),
      pts[l][1] - w1 * Math.sin(a1),
    ]);
    return [vtxlist0, vtxlist1];
  }
  // line work with weight function
  function stroke(args: StrokeOptions) {
    var pts = args.pts != undefined ? args.pts : [];
    var ctx = args.ctx;
    var xof = args.xof != undefined ? args.xof : 0;
    var yof = args.yof != undefined ? args.yof : 0;
    var col = args.col != undefined ? args.col : "black";
    var wid =
      args.wid != undefined
        ? args.wid
        : (x: number) =>
            1 * sin(x * PI) * mapval(sketch.noise(x * 10), 0, 1, 0.5, 1);

    var [vtxlist0, vtxlist1] = tubify({ pts: pts, wid: wid });

    polygon({
      pts: vtxlist0.concat(vtxlist1.reverse()),
      ctx: ctx,
      fil: true,
      col: col,
      xof: xof,
      yof: yof,
    });
    return [vtxlist0, vtxlist1];
  }
  // generate paper texture
  function paper(args: PaperOptions = {}) {
    var col = args.col != undefined ? args.col : [0.98, 0.91, 0.74];
    var tex = args.tex != undefined ? args.tex : 20;
    var spr = args.spr != undefined ? args.spr : 1;

    var ctx = Layer.empty(512);
    var canvas = ctx.canvas;
    var reso = 512;
    for (var i = 0; i < reso / 2 + 1; i++) {
      for (var j = 0; j < reso / 2 + 1; j++) {
        var c = 255 - sketch.noise(i * 0.1, j * 0.1) * tex * 0.5;
        c -= sketch.random() * tex;
        var r = c * col[0];
        var g = c * col[1];
        var b = c * col[2];
        if (
          sketch.noise(i * 0.04, j * 0.04, 2) * sketch.random() * spr > 0.7 ||
          sketch.random() < 0.005 * spr
        ) {
          var r = c * 0.7;
          var g = c * 0.5;
          var b = c * 0.2;
        }
        ctx.fillStyle = rgba(r, g, b);
        ctx.fillRect(i, j, 1, 1);
        ctx.fillRect(reso - i, j, 1, 1);
        ctx.fillRect(i, reso - j, 1, 1);
        ctx.fillRect(reso - i, reso - j, 1, 1);
      }
    }
    return canvas;
  }
  return { polygon, tubify, stroke, paper };
}
export type Drawing = ReturnType<typeof createDrawing>;
