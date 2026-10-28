import { createCanvas, tilePaper } from "../rendering/canvas";

/** Composite the painting over paper so exported PNGs include the border area. */
export function downloadPainting(
  {
    painting,
    background,
  }: { painting: HTMLCanvasElement; background: HTMLCanvasElement },
  seed: string,
  subject: "plant" | "fish" = "plant",
): void {
  const context = createCanvas(painting.width, painting.height);
  tilePaper(context, background);
  context.drawImage(painting, 0, 0);
  const link = document.createElement("a");
  link.href = context.canvas.toDataURL("image/png");
  link.download = `${subject === "fish" ? "nonfishes" : "nonflowers"}-${seed.replace(/[^\p{L}\p{N}_-]/gu, "_")}.png`;
  link.click();
}
