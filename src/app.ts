import p5 from "p5";
import {
  createGenerator,
  PAINTING_SIZE,
  type Painting,
} from "./rendering/generator";
import { setupControls } from "./ui/controls";
import { element } from "./ui/dom";
import { downloadPainting } from "./ui/download";
import { readRequest, requestURL, type GenerationRequest } from "./ui/location";
import { mountBlocks } from "./ui/spinner/blocks";

/** Mount a sketch and its controls. Returns cleanup for development hot reload. */
export function mountApp(): () => void {
  const initial = readRequest();
  const container = element("canvas-container");
  const loader = element("loader");
  const content = element("content");
  mountBlocks(element("spinner"));
  loader.hidden = false;
  content.hidden = true;
  delete container.dataset.ready;
  let timer: number | undefined;
  let render:
    ((request: GenerationRequest, updateURL: boolean) => void) | undefined;
  let current: { painting: Painting; seed: string } | undefined;
  let shareURL = requestURL(initial);
  const controls = setupControls(
    initial,
    (request) => {
      window.clearTimeout(timer);
      container.dataset.ready = "false";
      timer = window.setTimeout(() => render?.(request, true), 250);
    },
    {
      download() {
        if (current) downloadPainting(current.painting, current.seed);
      },
      share() {
        void navigator.clipboard.writeText(shareURL.href).catch(console.error);
      },
    },
  );

  const sketch = new p5((p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(PAINTING_SIZE, PAINTING_SIZE);
      p.noLoop();
      p.describe(
        "A procedurally generated painting of an imaginary flowering plant on textured paper.",
      );
      const generator = createGenerator(p);
      render = (request, updateURL) => {
        container.setAttribute("aria-busy", "true");
        try {
          const result = generator.render(
            request.seed,
            request.mode === "manual" ? request.settings : undefined,
          );
          if (request.mode === "seed") controls.setSettings(result.settings);
          const context = p.drawingContext as CanvasRenderingContext2D;
          context.clearRect(0, 0, PAINTING_SIZE, PAINTING_SIZE);
          context.drawImage(result.painting, 0, 0);
          document.body.style.backgroundImage = `url(${result.background.toDataURL("image/png")})`;
          current = { painting: result, seed: request.seed };
          const url = requestURL(request);
          if (updateURL) window.history.replaceState(null, "", url);
          shareURL = url;
          loader.hidden = true;
          content.hidden = false;
          container.dataset.ready = "true";
          container.dataset.mode = request.mode;
          container.dataset.plantType = result.settings.plantType;
          container.dataset.revision = String(
            Number(container.dataset.revision ?? 0) + 1,
          );
        } catch (error) {
          element("spinner").hidden = true;
          element("load-text").textContent =
            "Unable to generate this painting. Please reload and try another seed.";
          loader.hidden = false;
          console.error(error);
        } finally {
          container.setAttribute("aria-busy", "false");
        }
      };
      // Let the loading indicator paint before the synchronous generation work.
      timer = window.setTimeout(() => render?.(initial, false), 50);
    };
  }, container);

  return () => {
    window.clearTimeout(timer);
    controls.destroy();
    sketch.remove();
  };
}
