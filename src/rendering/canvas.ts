/** Create a plain canvas for exports or copies independent of p5 buffer lifetime. */
export function createCanvas(
  width: number,
  height = width,
): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  return context;
}

export function copyCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const context = createCanvas(source.width, source.height);
  context.drawImage(source, 0, 0);
  return context.canvas;
}

export function tilePaper(
  context: CanvasRenderingContext2D,
  paper: HTMLCanvasElement,
): void {
  for (let x = 0; x < context.canvas.width; x += paper.width) {
    for (let y = 0; y < context.canvas.height; y += paper.height)
      context.drawImage(paper, x, y);
  }
}
