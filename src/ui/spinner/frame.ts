import type { SpinnerProps } from "./types";

/** Positions a cell within its sweep via the `--step` custom property. */
export function step(node: HTMLElement, index: number): void {
  node.style.setProperty("--step", String(index));
}

/** Injects a spinner's stylesheet once per document. */
export function injectStyle(name: string, css: string): void {
  if (document.head.querySelector(`style[data-spinner="${name}"]`)) return;
  const style = document.createElement("style");
  style.dataset.spinner = name;
  style.textContent = css;
  document.head.append(style);
}

/** Creates the root element for a spinner, sized from its props. */
export function spinnerRoot(
  name: string,
  { size }: SpinnerProps,
): HTMLDivElement {
  const root = document.createElement("div");
  root.className = `ld-${name}`;
  root.setAttribute("aria-hidden", "true");
  if (size) root.style.width = root.style.height = size;
  return root;
}
