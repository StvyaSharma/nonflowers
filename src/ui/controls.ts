import {
  createDialKit,
  createDialRoot,
  type DialConfig,
} from "dialkit/vanilla";
import {
  choices,
  metrics,
  defaultSettings,
  readSettings,
  type ManualSettings,
} from "../rendering/settings";
import type { GenerationRequest } from "./location";

/** Use DialKit's own renderer and stylesheet for every control and action. */
export function setupControls(
  initial: GenerationRequest,
  onChange: (request: GenerationRequest) => void,
  actions: { download(): void; share(): void },
) {
  const config: DialConfig = {
    "Generation mode": {
      type: "select",
      default: initial.mode,
      options: [
        { value: "seed", label: "Seed" },
        { value: "manual", label: "Manual" },
      ],
    },
    Seed: { type: "text", default: initial.seed },
    Generate: { type: "action", label: "Generate" },
    "New painting": { type: "action", label: "New painting" },
    "Download PNG": { type: "action", label: "Download PNG" },
    "Copy share link": { type: "action", label: "Copy share link" },
  };
  const paths = new Map<string, string>();
  function group(name: string): DialConfig {
    if (!config[name]) config[name] = { _collapsed: true };
    return config[name] as DialConfig;
  }
  for (const [key, definition] of Object.entries(choices)) {
    group(definition.group)[definition.label] = {
      type: "select",
      default: definition.initial,
      options: [...definition.options],
    };
    paths.set(key, `${definition.group}.${definition.label}`);
  }
  for (const [key, definition] of Object.entries(metrics)) {
    group(definition.group)[definition.label] = [
      definition.initial,
      definition.min,
      definition.max,
      definition.step,
    ];
    paths.set(key, `${definition.group}.${definition.label}`);
  }
  let synchronizing = false;
  const controller = createDialKit("Nonflowers", config, {
    onAction(action) {
      if (action === "Download PNG") actions.download();
      else if (action === "Copy share link") actions.share();
      else if (action === "New painting") {
        synchronizing = true;
        try {
          controller.setValues({
            Seed: Date.now().toString(),
            "Generation mode": "seed",
          });
        } finally {
          synchronizing = false;
        }
        onChange(getRequest());
      } else if (action === "Generate") onChange(getRequest());
    },
  });
  const root = createDialRoot({ productionEnabled: true });
  function getSettings(): ManualSettings {
    const values = controller.getValues();
    const settings: Record<string, unknown> = {};
    for (const [key, path] of paths) {
      const [folder, label] = path.split(".");
      settings[key] = (values[folder] as Record<string, unknown>)[label];
    }
    return readSettings(settings);
  }
  function getRequest(): GenerationRequest {
    const values = controller.getValues();
    const mode = values["Generation mode"] === "manual" ? "manual" : "seed";
    return {
      seed:
        typeof values.Seed === "string" && values.Seed
          ? values.Seed
          : initial.seed,
      mode,
      settings: mode === "manual" ? getSettings() : undefined,
    };
  }
  let lastSettings = "";
  let lastRequest = "";
  function setSettings(settings: ManualSettings): void {
    synchronizing = true;
    try {
      const values = readSettings(settings);
      const updates: Record<string, DialConfig> = {};
      for (const [key, path] of paths) {
        const [folder, label] = path.split(".");
        (updates[folder] ??= {})[label] = values[key as keyof ManualSettings];
      }
      controller.setValues(updates);
      lastSettings = JSON.stringify(getSettings());
      lastRequest = JSON.stringify(getRequest());
    } finally {
      synchronizing = false;
    }
  }
  setSettings(initial.settings ?? defaultSettings());
  const unsubscribe = controller.subscribe(() => {
    if (synchronizing) return;
    const settings = JSON.stringify(getSettings());
    if (
      settings !== lastSettings &&
      controller.getValues()["Generation mode"] === "seed"
    ) {
      lastSettings = settings;
      controller.setValue("Generation mode", "manual");
      return;
    }
    lastSettings = settings;
    const request = getRequest();
    const serialized = JSON.stringify(request);
    if (serialized === lastRequest) return;
    lastRequest = serialized;
    onChange(request);
  }, false);
  return {
    setSettings,
    destroy(): void {
      unsubscribe();
      root.destroy();
      controller.destroy();
    },
  };
}
