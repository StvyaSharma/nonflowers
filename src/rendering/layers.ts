import type p5 from "p5";
import { distance } from "./math";
import type { BlitOptions, PixelFilter } from "./types";

/** Owns offscreen p5 buffers; dispose after copying the completed painting. */
export function createLayers(sketch: p5) {
  const layers = new Map<CanvasRenderingContext2D, p5.Graphics>();
  // canvas context operations
  return {
    graphics(ctx: CanvasRenderingContext2D): p5.Graphics {
      const graphics = layers.get(ctx);
      if (!graphics) throw new Error("Missing p5 graphics layer");
      return graphics;
    },
    dispose(): void {
      for (const graphics of layers.values()) graphics.remove();
      layers.clear();
    },
    empty(w = 600, h = w): CanvasRenderingContext2D {
      w = w != undefined ? w : 600;
      h = h != undefined ? h : w;
      const graphics = sketch.createGraphics(w, h);
      graphics.pixelDensity(1);
      const context = graphics.drawingContext as CanvasRenderingContext2D;
      layers.set(context, graphics);
      return context;
    },
    blit(
      ctx0: CanvasRenderingContext2D,
      ctx1: CanvasRenderingContext2D,
      args: BlitOptions = {},
    ) {
      var ble: GlobalCompositeOperation =
        args.ble === "multiply" ? "multiply" : "source-over";
      var xof = args.xof != undefined ? args.xof : 0;
      var yof = args.yof != undefined ? args.yof : 0;
      ctx0.globalCompositeOperation = ble;
      ctx0.drawImage(ctx1.canvas, xof, yof);
    },
    filter(ctx: CanvasRenderingContext2D, f: PixelFilter) {
      var imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      var pix = imgd.data;
      for (var i = 0, n = pix.length; i < n; i += 4) {
        var [r, g, b, a] = pix.slice(i, i + 4);
        var x = (i / 4) % ctx.canvas.width;
        var y = Math.floor(i / 4 / ctx.canvas.width);
        var [r1, g1, b1, a1] = f(x, y, r, g, b, a);
        pix[i] = r1;
        pix[i + 1] = g1;
        pix[i + 2] = b1;
        pix[i + 3] = a1;
      }
      ctx.putImageData(imgd, 0, 0);
    },
    border(ctx: CanvasRenderingContext2D, f: (theta: number) => number) {
      var imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      var pix = imgd.data;
      for (var i = 0, n = pix.length; i < n; i += 4) {
        var [r, g, b, a] = pix.slice(i, i + 4);
        var x = (i / 4) % ctx.canvas.width;
        var y = Math.floor(i / 4 / ctx.canvas.width);

        var nx = (x / ctx.canvas.width - 0.5) * 2;
        var ny = (y / ctx.canvas.height - 0.5) * 2;
        var theta = Math.atan2(ny, nx);
        var r_ = distance([nx, ny], [0, 0]);
        var rr_ = f(theta);

        if (r_ > rr_) {
          pix[i] = 0;
          pix[i + 1] = 0;
          pix[i + 2] = 0;
          pix[i + 3] = 0;
        }
      }
      ctx.putImageData(imgd, 0, 0);
    },
    // find the dirty region - potentially optimizable
    bound(ctx: CanvasRenderingContext2D) {
      var xmin = ctx.canvas.width;
      var xmax = 0;
      var ymin = ctx.canvas.height;
      var ymax = 0;
      var imgd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      var pix = imgd.data;
      for (var i = 0, n = pix.length; i < n; i += 4) {
        var [r, g, b, a] = pix.slice(i, i + 4);
        var x = (i / 4) % ctx.canvas.width;
        var y = Math.floor(i / 4 / ctx.canvas.width);
        if (a > 0.001) {
          if (x < xmin) {
            xmin = x;
          }
          if (x > xmax) {
            xmax = x;
          }
          if (y < ymin) {
            ymin = y;
          }
          if (y > ymax) {
            ymax = y;
          }
        }
      }
      return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
    },
  };
}
export type Layers = ReturnType<typeof createLayers>;
