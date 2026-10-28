import { hashSeed } from "./random";
import type { FishGeometry, Point } from "./geometry";
import type { FishSettings } from "./settings";
import { palettes } from "./pigments";
/** Use the official standalone build as an offscreen WebGL2 material pass.
 * This leaves the existing p5 2D renderer untouched and provides an explicit
 * render()/clear() lifecycle rather than relying on p5 draw hooks.
 */
export function createBrushPainter() {
  let canvas: HTMLCanvasElement | undefined;
  let module: typeof import("p5.brush/standalone") | undefined;
  let disposed = false;
  return {
    async paint(
      seed: string,
      s: FishSettings,
      g: FishGeometry,
    ): Promise<HTMLCanvasElement> {
      module ??= await import("p5.brush/standalone");
      if (disposed) throw new DOMException("Disposed", "AbortError");
      if (!canvas) {
        canvas = module.createCanvas(600, 600, {
          parent: null,
          pixelDensity: 1,
        });
        module.scaleBrushes(3);
      }
      const brush = module;
      brush.load(canvas);
      brush.clear();
      brush.seed(hashSeed(`${seed}:brush`));
      brush.noiseSeed(hashSeed(`${seed}:brush-noise`));
      brush.noField();
      brush.noHatch();
      brush.noWash();
      brush.noStroke();
      brush.noFill();
      const palette = palettes[s.palette],
        css = (rgb: readonly number[]) => `rgb(${rgb.join(",")})`;
      if (s.brushOpacity > 0) {
        brush.fillBleed(s.bleed, "in", 0);
        brush.fillTexture(s.granulation, 0.35, true, 0.12);
        brush.fill(css(palette.yellow), s.brushOpacity * 65);
        brush.polygon(g.body.map(([x, y]) => [x - 300, y - 300] as const));
        for (const fin of g.fins) {
          brush.fill(css(palette.red), s.brushOpacity * 55);
          brush.polygon(
            fin.points.map(([x, y]) => [x - 300, y - 300] as const),
          );
        }
      }
      brush.noFill();
      if (s.ink > 0) {
        brush.set("2H", css(palette.dark), s.ink * 0.65);
        const outline = (points: Point[]) => {
          for (let i = 0; i < points.length; i++)
            brush.line(
              points[i][0] - 300,
              points[i][1] - 300,
              points[(i + 1) % points.length][0] - 300,
              points[(i + 1) % points.length][1] - 300,
            );
        };
        // Fewer hand-drawn segments retain silhouette fidelity without hundreds of strokes.
        outline(g.body.filter((_, i) => i % 3 === 0));
        for (const fin of g.fins) outline(fin.points);
      }
      brush.render();
      return canvas;
    },
    dispose() {
      disposed = true;
      // Upstream has no destroy API. Release the context owned by this pass.
      canvas
        ?.getContext("webgl2")
        ?.getExtension("WEBGL_lose_context")
        ?.loseContext();
      canvas = undefined;
    },
  };
}
