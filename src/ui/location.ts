import { readSettings, type ManualSettings } from "../rendering/settings";

export interface GenerationRequest {
  seed: string;
  mode: "seed" | "manual";
  settings?: ManualSettings;
}

export function readRequest(
  url = new URL(window.location.href),
): GenerationRequest {
  const seed = url.searchParams.get("seed") || Date.now().toString();
  if (url.searchParams.get("mode") !== "manual") return { seed, mode: "seed" };
  let input: unknown;
  try {
    input = JSON.parse(url.searchParams.get("controls") ?? "null");
  } catch {
    input = null;
  }
  return { seed, mode: "manual", settings: readSettings(input) };
}

export function requestURL(request: GenerationRequest): URL {
  const url = new URL(window.location.href);
  url.searchParams.set("seed", request.seed);
  if (request.mode === "manual" && request.settings) {
    url.searchParams.set("mode", "manual");
    url.searchParams.set("controls", JSON.stringify(request.settings));
  } else {
    url.searchParams.delete("mode");
    url.searchParams.delete("controls");
  }
  return url;
}
