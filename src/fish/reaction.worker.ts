import { simulateReaction } from "./reaction";
import type { FishSettings } from "./settings";
self.onmessage = (
  event: MessageEvent<{ seed: string; settings: FishSettings }>,
) => {
  try {
    const field = simulateReaction(event.data.seed, event.data.settings);
    self.postMessage({ field }, { transfer: [field.values.buffer] });
  } catch (error) {
    self.postMessage({ error: String(error) });
  }
};
