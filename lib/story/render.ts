// Dibuja la story (1080×1920) en Canvas 2D. Las medidas salen de la maqueta Share.dc.html
// (405×720) escaladas por 1080/405. Nunca incluye usernames.

import { HEART_LEFT, HEART_RIGHT } from "@/components/LogoMark";

export type StoryTheme = "neon" | "acid" | "night";

export const STORY_THEMES: Record<StoryTheme, { bg: string; fg: string; heart: string; box: string; boxFg: string }> = {
  neon: { bg: "#FF007F", fg: "#0A0A0A", heart: "#0A0A0A", box: "#0A0A0A", boxFg: "#FF007F" },
  acid: { bg: "#BADA55", fg: "#0A0A0A", heart: "#FF007F", box: "#0A0A0A", boxFg: "#BADA55" },
  night: { bg: "#0A0A0A", fg: "#F4F1EA", heart: "#FF007F", box: "#BADA55", boxFg: "#0A0A0A" },
};

export interface StoryOptions {
  theme: StoryTheme;
  count: number | null;
  headline: string;
  countLabel: string;
  footer: string;
  cta: string;
  year: number;
}

const W = 1080;
const H = 1920;
const K = W / 405;
const PAD_X = 30 * K;
const PAD_Y = 34 * K;

function family(varName: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

async function loadFonts(fonts: string[]) {
  try {
    await Promise.all(fonts.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch {
    /* si falla, se dibuja con la fuente de reserva */
  }
}

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.scale(cell, cell);
  ctx.save();
  ctx.translate(0, 1);
  ctx.fill(new Path2D(HEART_LEFT));
  ctx.restore();
  ctx.translate(1, 0);
  ctx.fill(new Path2D(HEART_RIGHT));
  ctx.restore();
}

export async function renderStory(canvas: HTMLCanvasElement, o: StoryOptions): Promise<void> {
  const display = family("--font-syne", "sans-serif");
  const body = family("--font-space-grotesk", "sans-serif");
  const mono = family("--font-space-mono", "monospace");

  let headlineSize = 44 * K;
  const numSize = 48 * K;
  const labelSize = 16 * K;
  const topSize = 13 * K;
  const footSize = 12 * K;

  await loadFonts([
    `800 ${headlineSize}px ${display}`,
    `700 ${numSize}px ${mono}`,
    `400 ${footSize}px ${mono}`,
    `700 ${labelSize}px ${body}`,
  ]);

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const t = STORY_THEMES[o.theme];

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "top";

  // Fila superior.
  ctx.fillStyle = t.fg;
  ctx.font = `700 ${topSize}px ${mono}`;
  setSpacing(ctx, 0);
  ctx.textAlign = "left";
  ctx.fillText("NOSOYTUFAN.COM", PAD_X, PAD_Y);
  ctx.textAlign = "right";
  ctx.fillText(String(o.year), W - PAD_X, PAD_Y);
  ctx.textAlign = "left";
  const topH = topSize * 1.25;

  // Pie.
  const footLH = footSize * 1.5;
  const footH = footLH * 2;

  // Bloque central: corazón + titular + caja con el número.
  const cell = Math.floor((170 * K) / 14);
  const heartH = cell * 12;
  const gap = 26 * K;
  const maxW = W - PAD_X * 2;
  // Reduce el titular hasta que la palabra más larga (p. ej. "nosoytufan.com") quepa en una línea.
  for (;;) {
    ctx.font = `800 ${headlineSize}px ${display}`;
    setSpacing(ctx, -0.035 * headlineSize);
    const widest = Math.max(...o.headline.split(/s+/).map((w) => ctx.measureText(w).width));
    if (widest <= maxW || headlineSize < 60) break;
    headlineSize *= 0.95;
  }
  const lines = wrap(ctx, o.headline, maxW);
  const lineH = headlineSize * 0.98;
  const headlineH = lines.length * lineH;

  const boxPadX = 18 * K;
  const boxPadY = 14 * K;
  const boxGap = 14 * K;
  const labelLH = labelSize * 1.2;
  let boxW = 0;
  let boxH = 0;
  let labelLines: string[] = [];
  if (o.count !== null) {
    ctx.font = `700 ${numSize}px ${mono}`;
    setSpacing(ctx, 0);
    const numW = ctx.measureText(String(o.count)).width;
    ctx.font = `700 ${labelSize}px ${body}`;
    labelLines = wrap(ctx, o.countLabel, 200 * K);
    const labelW = Math.max(...labelLines.map((l) => ctx.measureText(l).width));
    boxW = Math.min(W - PAD_X * 2, boxPadX * 2 + numW + boxGap + labelW);
    boxH = boxPadY * 2 + Math.max(numSize, labelLines.length * labelLH);
  }

  const midH = heartH + gap + headlineH + (o.count !== null ? gap + boxH : 0);
  const free = H - PAD_Y * 2 - topH - footH - midH;
  let y = PAD_Y + topH + free / 2;

  drawHeart(ctx, PAD_X, y, cell, t.heart);
  y += heartH + gap;

  ctx.fillStyle = t.fg;
  ctx.font = `800 ${headlineSize}px ${display}`;
  setSpacing(ctx, -0.035 * headlineSize);
  for (const line of lines) {
    ctx.fillText(line, PAD_X, y + (lineH - headlineSize) / 2);
    y += lineH;
  }

  if (o.count !== null) {
    y += gap;
    ctx.fillStyle = t.box;
    ctx.fillRect(PAD_X, y, boxW, boxH);
    ctx.fillStyle = t.boxFg;
    ctx.font = `700 ${numSize}px ${mono}`;
    setSpacing(ctx, 0);
    ctx.textBaseline = "middle";
    const cy = y + boxH / 2;
    ctx.fillText(String(o.count), PAD_X + boxPadX, cy);
    const numW = ctx.measureText(String(o.count)).width;
    ctx.font = `700 ${labelSize}px ${body}`;
    const lx = PAD_X + boxPadX + numW + boxGap;
    const ly = cy - ((labelLines.length - 1) * labelLH) / 2;
    labelLines.forEach((l, i) => ctx.fillText(l, lx, ly + i * labelLH));
    ctx.textBaseline = "top";
  }

  ctx.fillStyle = t.fg;
  ctx.font = `400 ${footSize}px ${mono}`;
  setSpacing(ctx, 0);
  const fy = H - PAD_Y - footH;
  ctx.fillText(o.footer, PAD_X, fy);
  ctx.fillText(o.cta, PAD_X, fy + footLH);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
