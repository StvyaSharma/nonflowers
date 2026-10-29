import type p5 from "p5";
import { copyCanvas, tilePaper } from "./canvas";
import { createDrawing } from "./drawing";
import { createLayers } from "./layers";
import { squircle } from "./math";
import { sampleParameters, type Parameters } from "./parameters";
import { createPlants } from "./plants";
import { seedSketch } from "./random";
import { createStructures } from "./structures";
import { compileParameters } from "./manual";
import { readSettings, type ManualSettings } from "./settings";

export const PAINTING_SIZE = 600;
export interface Painting {
  painting: HTMLCanvasElement;
  background: HTMLCanvasElement;
  parameters: Parameters;
  settings: ManualSettings;
}

/** Render one seeded painting, releasing all temporary buffers before returning. */
export function createGenerator(sketch: p5) {
  const layers = createLayers(sketch);
  const drawing = createDrawing(sketch, layers);

  return {
    render(seed: string, manual?: ManualSettings): Painting {
      const overrides = manual ? readSettings(manual) : undefined;
      const plants = createPlants(
        sketch,
        layers,
        createStructures(sketch, drawing, overrides),
        Boolean(overrides),
      );
      seedSketch(sketch, seed);
      sketch.noiseDetail(
        overrides?.noiseOctaves ?? 4,
        overrides?.noiseFalloff ?? 0.5,
      );
      try {
        const background = drawing.paper({
          col: overrides
            ? [
                overrides.backgroundRed,
                overrides.backgroundGreen,
                overrides.backgroundBlue,
              ]
            : [1, 0.99, 0.9],
          tex: overrides?.backgroundTexture ?? 10,
          spr: overrides?.backgroundSpeckles ?? 0,
        });
        const context = layers.empty(PAINTING_SIZE);
        const texture = drawing.paper({
          col: overrides
            ? [overrides.paperRed, overrides.paperGreen, overrides.paperBlue]
            : [0.98, 0.91, 0.74],
          tex: overrides?.paperTexture ?? 20,
          spr: overrides?.paperSpeckles ?? 1,
        });
        tilePaper(context, texture);
        const woody = sketch.random() <= 0.5;
        const sampled = sampleParameters(sketch);
        const settings: ManualSettings = overrides ?? {
          ...sampled.settings,
          plantType: woody ? "woody" : "herbal",
        };
        const parameters = overrides
          ? compileParameters(sketch, overrides)
          : sampled.parameters;
        if (settings.plantType === "woody")
          plants.woody({ ctx: context, xof: 300, yof: 550, parameters });
        else plants.herbal({ ctx: context, xof: 300, yof: 600, parameters });
        layers.border(
          context,
          squircle(settings.borderRadius, settings.borderPower),
        );
        return {
          painting: copyCanvas(context.canvas),
          background: copyCanvas(background),
          parameters,
          settings,
        };
      } finally {
        layers.dispose();
      }
    },
  };
}
