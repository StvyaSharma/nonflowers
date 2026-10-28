import {
  bodyCoordinates,
  centerY,
  halfDepth,
  polygonPath,
  type FishGeometry,
  type Fin,
} from "./geometry";
import type { FishSettings } from "./settings";
import { bodyPigment, pigmentAt, palettes } from "./pigments";
import { createCanvas } from "../rendering/canvas";
import { sampleField, type PatternField } from "./reaction";
import { clamp } from "./patterns";
import { randomStream } from "./random";
export function paintTissue(
  ctx: CanvasRenderingContext2D,
  g: FishGeometry,
  s: FishSettings,
  seedPhase: number,
  field?: PatternField,
  fin?: Fin,
): void {
  const points = fin?.points ?? g.body;
  const minX = Math.max(0, Math.floor(Math.min(...points.map((p) => p[0])))),
    maxX = Math.min(599, Math.ceil(Math.max(...points.map((p) => p[0]))));
  const minY = Math.max(0, Math.floor(Math.min(...points.map((p) => p[1])))),
    maxY = Math.min(599, Math.ceil(Math.max(...points.map((p) => p[1]))));
  const layer = createCanvas(600),
    image = layer.createImageData(maxX - minX + 1, maxY - minY + 1);
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const [u, v] = bodyCoordinates(x, y, g);
      // Fin rays bend local pattern coordinates while the reaction field remains continuous.
      const ray = fin
        ? s.rayInfluence * Math.atan2(y - fin.root[1], x - fin.root[0]) * 0.2
        : 0;
      const pigment = fin
        ? pigmentAt(fin.region, u, v + ray, x, y, s, field, seedPhase)
        : bodyPigment(u, v, x, y, s, field, seedPhase);
      const index = ((y - minY) * (maxX - minX + 1) + x - minX) * 4;
      let rgb = pigment.color;
      if (s.view === "melanin")
        rgb = [1, 1, 1].map(() => 245 - pigment.dark * 220) as [
          number,
          number,
          number,
        ];
      else if (s.view === "warm")
        rgb = [100 + pigment.warm * 140, 60 + pigment.warm * 120, 50];
      else if (s.view === "reflection")
        rgb = [
          35 + pigment.reflection * 140,
          50 + pigment.reflection * 175,
          80 + pigment.reflection * 160,
        ];
      else if (s.view === "reaction") {
        const b = field ? sampleField(field, x, y) : 0;
        rgb = [30 + b * 215, 50 + b * 180, 85 + b * 80];
      } else if (s.view === "regions") {
        if (fin)
          rgb = (
            {
              tail: [208, 139, 110],
              dorsal: [149, 141, 196],
              anal: [107, 171, 167],
              pectoral: [220, 166, 73],
              pelvic: [182, 141, 158],
            } as Record<string, [number, number, number]>
          )[fin.region];
        else
          rgb =
            u < 0.22
              ? [203, 150, 108]
              : v < -0.45
                ? [100, 141, 166]
                : v > 0.5
                  ? [226, 210, 163]
                  : [135, 173, 136];
      }
      image.data[index] = rgb[0];
      image.data[index + 1] = rgb[1];
      image.data[index + 2] = rgb[2];
      image.data[index + 3] = 255;
    }
  layer.putImageData(image, minX, minY);
  ctx.save();
  polygonPath(ctx, points);
  ctx.clip();
  ctx.globalAlpha = fin ? s.finOpacity : 1;
  ctx.drawImage(layer.canvas, 0, 0);
  ctx.restore();
}
export function paintScales(
  ctx: CanvasRenderingContext2D,
  g: FishGeometry,
  s: FishSettings,
  seed: string,
): void {
  const random = randomStream(`${seed}:scales`),
    spacing = s.scaleSize;
  ctx.save();
  polygonPath(ctx, g.body);
  ctx.clip();
  for (let row = -16; row <= 16; row++)
    for (let col = 0; col < g.length / spacing; col++) {
      const x = g.x0 + (col + 0.5 * (row % 2)) * spacing,
        u = (x - g.x0) / g.length;
      if (u < 0.2 || u > 0.96) continue;
      const y = centerY(u, g) + row * spacing * 0.72;
      const v = (y - centerY(u, g)) / halfDepth(u, g);
      if (Math.abs(v) > 1) continue;
      ctx.beginPath();
      ctx.ellipse(x, y, spacing * 0.58, spacing * 0.46, 0, -1.15, 1.15);
      ctx.strokeStyle = `rgba(30,48,47,${s.scaleOpacity * (0.15 + random() * 0.3)})`;
      ctx.lineWidth = 0.55;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(
        x - 0.7,
        y - 0.7,
        spacing * 0.5,
        spacing * 0.4,
        0,
        -1.15,
        0.65,
      );
      ctx.strokeStyle = `rgba(244,244,217,${s.iridophore * s.scaleOpacity * (1 - clamp(Math.abs(v))) * 0.8})`;
      ctx.stroke();
    }
  ctx.restore();
}
export function paintFinRays(
  ctx: CanvasRenderingContext2D,
  fin: Fin,
  s: FishSettings,
): void {
  const points = fin.points,
    p = palettes[s.palette];
  ctx.save();
  polygonPath(ctx, points);
  ctx.clip();
  // Sample the free perimeter, fanning rays from the anatomical attachment.
  for (let i = 1; i <= s.finRays; i++) {
    const t = (i / (s.finRays + 1)) * (points.length - 2),
      j = Math.min(points.length - 2, Math.floor(t) + 1),
      f = t - Math.floor(t);
    const a = points[j],
      b = points[Math.min(j + 1, points.length - 1)];
    const x = a[0] * (1 - f) + b[0] * f,
      y = a[1] * (1 - f) + b[1] * f;
    ctx.beginPath();
    ctx.moveTo(...fin.root);
    ctx.quadraticCurveTo(
      (fin.root[0] + x) / 2 + 3,
      (fin.root[1] + y) / 2,
      x,
      y,
    );
    ctx.strokeStyle = `rgba(${p.dark.join(",")},${0.15 + s.ink * 0.35})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  polygonPath(ctx, points);
  ctx.strokeStyle = `rgba(251,242,213,${s.rim})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}
export function paintDetails(
  ctx: CanvasRenderingContext2D,
  g: FishGeometry,
  s: FishSettings,
): void {
  const eyeX = g.x0 + g.length * 0.105,
    eyeY = centerY(0.105, g) - g.depth * 0.12;
  ctx.save();
  ctx.strokeStyle = `rgba(35,46,42,${s.ink})`;
  ctx.lineWidth = 0.8;
  // Gill cover and lateral line, anchored to the same body coordinates as the fields.
  const gx = g.x0 + g.length * 0.22;
  ctx.beginPath();
  ctx.moveTo(gx - 8, centerY(0.22, g) - halfDepth(0.22, g) * 0.83);
  ctx.bezierCurveTo(
    gx + 20,
    285,
    gx + 17,
    315,
    gx - 4,
    centerY(0.22, g) + halfDepth(0.22, g) * 0.8,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(g.x0 - 1, 301);
  ctx.lineTo(g.x0 + 15, 303);
  ctx.stroke();
  ctx.globalAlpha = s.lateralCue * 0.45;
  ctx.beginPath();
  for (let i = 15; i < 95; i++) {
    const u = i / 100,
      x = g.x0 + g.length * u,
      y = centerY(u, g) - halfDepth(u, g) * 0.06;
    if (i === 15) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#dac592";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s.eyeSize + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#242d2d";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s.eyeSize * 0.66, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#faf2d7";
  ctx.beginPath();
  ctx.arc(eyeX - 1.5, eyeY - 2, s.eyeSize * 0.19, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
