// Plant algorithms adapted from Nonflowers, (c) Lingdong Huang 2018 (MIT).
import type p5 from "p5";
import { PI, sin, pow, mapval } from "./math";
import { grot } from "./vectors";
import { createRandom } from "./random";
import { createFilters } from "./filters";
import type { Layers } from "./layers";
import type { Structures } from "./structures";
import type { DrawOptions } from "./types";
import type { Parameters } from "./parameters";

interface PlantOptions extends DrawOptions {
  parameters: Parameters;
}

export function createPlants(
  sketch: p5,
  Layer: Layers,
  structures: Structures,
  manual = false,
) {
  const { normRand } = createRandom(sketch);
  const { leaf, stem, branch } = structures;
  const Filter = createFilters(sketch);
  // generate a woody plant
  function woody(args: PlantOptions) {
    var ctx = args.ctx;
    var xof = args.xof != undefined ? args.xof : 0;
    var yof = args.yof != undefined ? args.yof : 0;
    const PAR = args.parameters;

    var cwid = 1200;
    var lay0 = Layer.empty(cwid);
    var lay1 = Layer.empty(cwid);

    var PL = branch({
      ctx: lay0,
      xof: cwid * 0.5,
      yof: cwid * 0.7,
      wid: PAR.branchWidth,
      twi: PAR.branchTwist,
      dep: PAR.branchDepth,
      col: PAR.branchColor,
      frk: PAR.branchFork,
    });

    for (var i = 0; i < PL.length; i++) {
      if (i / PL.length > 0.1) {
        for (var j = 0; j < PL[i][1].length; j++) {
          if (sketch.random() < PAR.leafChance) {
            leaf({
              ctx: lay0,
              xof: PL[i][1][j][0],
              yof: PL[i][1][j][1],
              len: PAR.leafLength * normRand(0.8, 1.2),
              vei: PAR.leafType,
              col: PAR.leafColor,
              rot: [
                normRand(-1, 1) * PI,
                normRand(-1, 1) * PI,
                normRand(-1, 1) * 0,
              ],
              wid: (x: number) => PAR.leafShape(x) * PAR.leafWidth,
              ben: (x: number) => [
                mapval(sketch.noise(x * 1, i), 0, 1, -1, 1) * 5,
                0,
                mapval(sketch.noise(x * 1, i + PI), 0, 1, -1, 1) * 5,
              ],
            });
          }

          if (sketch.random() < PAR.flowerChance) {
            var hr = [
              normRand(-1, 1) * PI,
              normRand(-1, 1) * PI,
              normRand(-1, 1) * 0,
            ];

            var P_ = stem({
              ctx: lay0,
              xof: PL[i][1][j][0],
              yof: PL[i][1][j][1],
              rot: hr,
              len: PAR.pedicelLength,
              col: { min: [50, 1, 0.9, 1], max: [50, 1, 0.9, 1] },
              wid: (x: number) => sin(x * PI) * x * 2 + 1,
              ben: (x: number) => [0, 0, 0],
            });

            if (manual && sketch.random() >= PAR.flowerChance) continue;
            var op = sketch.random();

            var r = grot(P_, -1);
            var hhr = r;
            for (var k = 0; k < PAR.flowerPetal; k++) {
              leaf({
                ctx: lay1,
                flo: true,
                xof: PL[i][1][j][0] + P_.at(-1)![0],
                yof: PL[i][1][j][1] + P_.at(-1)![1],
                rot: [hhr[0], hhr[1], hhr[2] + (k / PAR.flowerPetal) * PI * 2],
                len: PAR.flowerLength * normRand(0.7, 1.3),
                wid: (x: number) => PAR.flowerShape(x) * PAR.flowerWidth,
                vei: [0],
                col: PAR.flowerColor,
                cof: PAR.flowerColorCurve,
                ben: (x: number) => [PAR.flowerOpenCurve(x, op), 0, 0],
              });

              leaf({
                ctx: lay1,
                flo: true,
                xof: PL[i][1][j][0] + P_.at(-1)![0],
                yof: PL[i][1][j][1] + P_.at(-1)![1],
                rot: [hhr[0], hhr[1], hhr[2] + (k / PAR.flowerPetal) * PI * 2],
                len: PAR.innerLength * normRand(0.8, 1.2),
                wid: (x: number) =>
                  manual ? PAR.innerShape(x) * PAR.innerWidth : sin(x * PI) * 4,
                vei: [0],
                col: PAR.innerColor,
                cof: (x: number) => x,
                ben: (x: number) => [PAR.flowerOpenCurve(x, op), 0, 0],
              });
            }
          }
        }
      }
    }
    Layer.filter(lay0, Filter.fade);
    Layer.filter(lay0, Filter.wispy);
    Layer.filter(lay1, Filter.wispy);
    var b1 = Layer.bound(lay0);
    var b2 = Layer.bound(lay1);
    var bd = {
      xmin: Math.min(b1.xmin, b2.xmin),
      xmax: Math.max(b1.xmax, b2.xmax),
      ymin: Math.min(b1.ymin, b2.ymin),
      ymax: Math.max(b1.ymax, b2.ymax),
    };
    var xref = xof - (bd.xmin + bd.xmax) / 2;
    var yref = yof - bd.ymax;
    Layer.blit(ctx, lay0, { ble: "multiply", xof: xref, yof: yref });
    Layer.blit(ctx, lay1, { ble: "normal", xof: xref, yof: yref });
  }

  // generate a herbaceous plant
  function herbal(args: PlantOptions) {
    var ctx = args.ctx;
    var xof = args.xof != undefined ? args.xof : 0;
    var yof = args.yof != undefined ? args.yof : 0;
    const PAR = args.parameters;

    var cwid = 1200;
    var lay0 = Layer.empty(cwid);
    var lay1 = Layer.empty(cwid);

    var x0 = cwid * 0.5;
    var y0 = cwid * 0.7;

    for (var i = 0; i < PAR.stemCount; i++) {
      var r = [PI / 2, 0, normRand(-1, 1) * PI];
      var P = stem({
        ctx: lay0,
        xof: x0,
        yof: y0,
        len: PAR.stemLength * normRand(0.7, 1.3),
        rot: r,
        wid: (x: number) =>
          PAR.stemWidth *
          (pow(sin((x * PI) / 2 + PI / 2), 0.5) * sketch.noise(x * 10) * 0.5 +
            0.5),
        ben: (x: number) => [
          mapval(sketch.noise(x * 1, i), 0, 1, -1, 1) * x * PAR.stemBend,
          0,
          mapval(sketch.noise(x * 1, i + PI), 0, 1, -1, 1) * x * PAR.stemBend,
        ],
      });

      if (PAR.leafPosition == 2) {
        for (var j = 0; j < P.length; j++)
          if (sketch.random() < PAR.leafChance * 2) {
            leaf({
              ctx: lay0,
              xof: x0 + P[j][0],
              yof: y0 + P[j][1],
              len: 2 * PAR.leafLength * normRand(0.8, 1.2),
              vei: PAR.leafType,
              col: PAR.leafColor,
              rot: [
                normRand(-1, 1) * PI,
                normRand(-1, 1) * PI,
                normRand(-1, 1) * 0,
              ],
              wid: (x: number) => 2 * PAR.leafShape(x) * PAR.leafWidth,
              ben: (x: number) => [
                mapval(sketch.noise(x * 1, i), 0, 1, -1, 1) * 5,
                0,
                mapval(sketch.noise(x * 1, i + PI), 0, 1, -1, 1) * 5,
              ],
            });
          }
      }

      var hr = grot(P, -1);
      if (PAR.sheathLength != 0) {
        stem({
          ctx: lay0,
          xof: x0 + P.at(-1)![0],
          yof: y0 + P.at(-1)![1],
          rot: hr,
          len: PAR.sheathLength,
          col: { min: [60, 0.3, 0.9, 1], max: [60, 0.3, 0.9, 1] },
          wid: (x: number) =>
            PAR.sheathWidth * (pow(sin(x * PI), 2) - x * 0.5 + 0.5),
          ben: (x: number) => [0, 0, 0],
        });
      }
      for (
        var j = 0;
        j <
        (manual
          ? PAR.shootCount
          : Math.max(1, PAR.shootCount * normRand(0.5, 1.5)));
        j++
      ) {
        var P_ = stem({
          ctx: lay0,
          xof: x0 + P.at(-1)![0],
          yof: y0 + P.at(-1)![1],
          rot: hr,
          len: PAR.shootLength * normRand(0.5, 1.5),
          col: { min: [70, 0.2, 0.9, 1], max: [70, 0.2, 0.9, 1] },
          wid: (x: number) => 2,
          ben: (x: number) => [
            mapval(sketch.noise(x * 1, j), 0, 1, -1, 1) * x * 10,
            0,
            mapval(sketch.noise(x * 1, j + PI), 0, 1, -1, 1) * x * 10,
          ],
        });
        if (manual && sketch.random() >= PAR.flowerChance) continue;
        var op = sketch.random();
        var hhr = [
          normRand(-1, 1) * PI,
          normRand(-1, 1) * PI,
          normRand(-1, 1) * PI,
        ];
        for (var k = 0; k < PAR.flowerPetal; k++) {
          leaf({
            ctx: lay1,
            flo: true,
            xof: x0 + P.at(-1)![0] + P_.at(-1)![0],
            yof: y0 + P.at(-1)![1] + P_.at(-1)![1],
            rot: [hhr[0], hhr[1], hhr[2] + (k / PAR.flowerPetal) * PI * 2],
            len: PAR.flowerLength * normRand(0.7, 1.3) * 1.5,
            wid: (x: number) => 1.5 * PAR.flowerShape(x) * PAR.flowerWidth,
            vei: [0],
            col: PAR.flowerColor,
            cof: PAR.flowerColorCurve,
            ben: (x: number) => [PAR.flowerOpenCurve(x, op), 0, 0],
          });

          leaf({
            ctx: lay1,
            flo: true,
            xof: x0 + P.at(-1)![0] + P_.at(-1)![0],
            yof: y0 + P.at(-1)![1] + P_.at(-1)![1],
            rot: [hhr[0], hhr[1], hhr[2] + (k / PAR.flowerPetal) * PI * 2],
            len: PAR.innerLength * normRand(0.8, 1.2),
            wid: (x: number) =>
              manual ? PAR.innerShape(x) * PAR.innerWidth : sin(x * PI) * 4,
            vei: [0],
            col: PAR.innerColor,
            cof: (x: number) => x,
            ben: (x: number) => [PAR.flowerOpenCurve(x, op), 0, 0],
          });
        }
      }
    }
    if (PAR.leafPosition == 1) {
      for (var i = 0; i < PAR.leafChance * 100; i++) {
        leaf({
          ctx: lay0,
          xof: x0,
          yof: y0,
          rot: [PI / 3, 0, normRand(-1, 1) * PI],
          len: 4 * PAR.leafLength * normRand(0.8, 1.2),
          ...(manual ? { col: PAR.leafColor } : {}),
          wid: (x: number) => 2 * PAR.leafShape(x) * PAR.leafWidth,
          vei: PAR.leafType,
          ben: (x: number) => [
            mapval(sketch.noise(x * 1, i), 0, 1, -1, 1) * 10,
            0,
            mapval(sketch.noise(x * 1, i + PI), 0, 1, -1, 1) * 10,
          ],
        });
      }
    }
    Layer.filter(lay0, Filter.fade);
    Layer.filter(lay0, Filter.wispy);
    Layer.filter(lay1, Filter.wispy);
    var b1 = Layer.bound(lay0);
    var b2 = Layer.bound(lay1);
    var bd = {
      xmin: Math.min(b1.xmin, b2.xmin),
      xmax: Math.max(b1.xmax, b2.xmax),
      ymin: Math.min(b1.ymin, b2.ymin),
      ymax: Math.max(b1.ymax, b2.ymax),
    };
    var xref = xof - (bd.xmin + bd.xmax) / 2;
    var yref = yof - bd.ymax;
    Layer.blit(ctx, lay0, { ble: "multiply", xof: xref, yof: yref });
    Layer.blit(ctx, lay1, { ble: "normal", xof: xref, yof: yref });
  }
  return { woody, herbal };
}
