/** Default edge length shared by every spinner. */
export const SIZE = "120px";

/** Full sweep duration per spinner, in seconds. */
const DURATIONS: Record<string, number> = {
  blocks: 1.4,
};

/** Declaration that runs a named keyframe animation for a spinner. */
export function animation(
  name: string,
  keyframes: string,
  easing: string,
): string {
  return `animation: ${keyframes} ${DURATIONS[name]}s ${easing} infinite;`;
}

/**
 * Delay for one cell in a sweep of `count` distinct steps. Each cell reads its
 * step index from the `--step` custom property set by `step()`.
 */
export function stagger(name: string, count: number): string {
  return `calc(var(--step, 0) * ${DURATIONS[name]}s / ${count})`;
}
