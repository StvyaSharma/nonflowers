import { readSettings, type ManualSettings } from "../rendering/settings";
import { readFishSettings, type FishSettings } from "../fish/settings";
export interface GenerationRequest {
  seed: string;
  mode: "seed" | "manual";
  subject?: "plant" | "fish";
  settings?: ManualSettings;
  fishSettings?: FishSettings;
}
export function readRequest(
  url = new URL(window.location.href),
): GenerationRequest {
  const seed = url.searchParams.get("seed") || Date.now().toString();
  const subject = url.searchParams.get("subject") === "fish" ? "fish" : "plant";
  if (url.searchParams.get("mode") !== "manual")
    return { seed, subject, mode: "seed" };
  let input: unknown;
  try {
    input = JSON.parse(url.searchParams.get("controls") ?? "null");
  } catch {
    input = null;
  }
  return subject === "fish"
    ? { seed, subject, mode: "manual", fishSettings: readFishSettings(input) }
    : { seed, subject, mode: "manual", settings: readSettings(input) };
}
export function requestURL(request: GenerationRequest): URL {
  const url = new URL(window.location.href);
  url.searchParams.set("seed", request.seed);
  if (request.subject === "fish") url.searchParams.set("subject", "fish");
  else url.searchParams.delete("subject");
  const settings =
    request.subject === "fish" ? request.fishSettings : request.settings;
  if (request.mode === "manual" && settings) {
    url.searchParams.set("mode", "manual");
    url.searchParams.set("controls", JSON.stringify(settings));
  } else {
    url.searchParams.delete("mode");
    url.searchParams.delete("controls");
  }
  return url;
}
