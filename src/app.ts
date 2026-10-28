import p5 from "p5";
import { createGenerator, PAINTING_SIZE } from "./rendering/generator";
import { createFishGenerator } from "./fish/generator";
import { setupControls } from "./ui/controls";
import { element } from "./ui/dom";
import { downloadPainting } from "./ui/download";
import { readRequest, requestURL, type GenerationRequest } from "./ui/location";
/** Mount the existing plant renderer and the independent layered fish renderer. */
export function mountApp(): () => void {
  const initial = readRequest(),
    container = element("canvas-container"),
    loader = element("loader"),
    content = element("content");
  loader.hidden = false;
  content.hidden = true;
  delete container.dataset.ready;
  let timer: number | undefined,
    render:
      | ((request: GenerationRequest, updateURL: boolean) => Promise<void>)
      | undefined;
  let active: AbortController | undefined,
    disposed = false;
  let current:
    | {
        painting: {
          painting: HTMLCanvasElement;
          background: HTMLCanvasElement;
        };
        seed: string;
        subject: "plant" | "fish";
      }
    | undefined;
  let shareURL = requestURL(initial);
  const fishGenerator = createFishGenerator();
  const controls = setupControls(
    initial,
    (request) => {
      window.clearTimeout(timer);
      active?.abort();
      container.dataset.ready = "false";
      container.setAttribute("aria-busy", "true");
      timer = window.setTimeout(() => void render?.(request, true), 250);
    },
    {
      download() {
        if (current && container.dataset.ready === "true")
          downloadPainting(current.painting, current.seed, current.subject);
      },
      share() {
        if (container.dataset.ready === "true")
          void navigator.clipboard
            .writeText(shareURL.href)
            .catch(console.error);
      },
    },
  );
  const sketch = new p5((p) => {
    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(PAINTING_SIZE, PAINTING_SIZE);
      p.noLoop();
      const plantGenerator = createGenerator(p);
      render = async (request, updateURL) => {
        active?.abort();
        const job = new AbortController();
        active = job;
        container.setAttribute("aria-busy", "true");
        try {
          const subject = request.subject ?? "plant";
          const result =
            subject === "fish"
              ? await fishGenerator.render(
                  request.seed,
                  request.mode === "manual" ? request.fishSettings : undefined,
                  job.signal,
                )
              : plantGenerator.render(
                  request.seed,
                  request.mode === "manual" ? request.settings : undefined,
                );
          if (job.signal.aborted || disposed) return;
          if ("fishSettings" in result) {
            if (request.mode === "seed")
              controls.setFishSettings(result.fishSettings);
            container.dataset.fishPattern = result.fishSettings.pattern;
            container.dataset.fieldRange = result.field
              ? `${result.field.min},${result.field.max}`
              : "";
          } else {
            if (request.mode === "seed") controls.setSettings(result.settings);
            container.dataset.plantType = result.settings.plantType;
          }
          p.describe(
            subject === "fish"
              ? "An imaginary fish with layered pigment patterns, reflective scales and watercolor fins on textured paper."
              : "A procedurally generated painting of an imaginary flowering plant on textured paper.",
          );
          const context = p.drawingContext as CanvasRenderingContext2D;
          context.clearRect(0, 0, PAINTING_SIZE, PAINTING_SIZE);
          context.drawImage(result.painting, 0, 0);
          document.body.style.backgroundImage = `url(${result.background.toDataURL("image/png")})`;
          current = { painting: result, seed: request.seed, subject };
          // Serialize the validated, complete manual recipe rather than malformed URL input.
          const canonical = { ...request };
          if (request.mode === "manual") {
            if ("fishSettings" in result)
              canonical.fishSettings = result.fishSettings;
            else canonical.settings = result.settings;
          }
          const url = requestURL(canonical);
          if (updateURL) window.history.replaceState(null, "", url);
          shareURL = url;
          loader.hidden = true;
          content.hidden = false;
          container.dataset.ready = "true";
          container.dataset.mode = request.mode;
          container.dataset.subject = subject;
          container.dataset.revision = String(
            Number(container.dataset.revision ?? 0) + 1,
          );
        } catch (error) {
          if (job.signal.aborted || disposed) return;
          element("spinner").hidden = true;
          element("load-text").textContent =
            "Unable to generate this painting. Please try another seed or subject. Fish watercolor requires WebGL2.";
          loader.hidden = false;
          console.error(error);
        } finally {
          if (active === job) container.setAttribute("aria-busy", "false");
        }
      };
      timer = window.setTimeout(() => void render?.(initial, false), 50);
    };
  }, container);
  return () => {
    disposed = true;
    active?.abort();
    window.clearTimeout(timer);
    controls.destroy();
    fishGenerator.dispose();
    sketch.remove();
  };
}
