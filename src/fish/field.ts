import type { FishSettings } from "./settings";
import type { PatternField } from "./reaction";
/** Terminating superseded workers prevents old renders from blocking or winning a race. */
export function growField(
  seed: string,
  settings: FishSettings,
  signal: AbortSignal,
): Promise<PatternField> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Superseded", "AbortError"));
      return;
    }
    const worker = new Worker(
      new URL("./reaction.worker.ts", import.meta.url),
      { type: "module" },
    );
    const cleanup = () => {
      worker.terminate();
      signal.removeEventListener("abort", abort);
    };
    const abort = () => {
      cleanup();
      reject(new DOMException("Superseded", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
    worker.onmessage = (
      event: MessageEvent<{ field?: PatternField; error?: string }>,
    ) => {
      cleanup();
      if (event.data.field) resolve(event.data.field);
      else reject(new Error(event.data.error));
    };
    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message));
    };
    worker.postMessage({ seed, settings });
  });
}
