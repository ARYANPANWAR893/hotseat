import type { Score } from "./types";

// Draws the shareable scorecard as a 1080x1350 PNG (LinkedIn/Instagram portrait). No library needed.
// Hotseat brand: forest green, lime score, cream type, Bricolage Grotesque + Figtree.
export async function renderScorecard(o: { score: Score; mood: string; company: string; role: string; name: string }): Promise<Blob> {
  const W = 1080, H = 1350, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  const css = getComputedStyle(document.documentElement);
  const head = css.getPropertyValue("--font-head").trim() || "system-ui, sans-serif";
  const body = css.getPropertyValue("--font-body").trim() || "system-ui, sans-serif";
  await Promise.all([`800 120px ${head}`, `700 40px ${head}`, `500 30px ${body}`, `700 30px ${body}`].map((f) => document.fonts.load(f).catch(() => [])));
  const FOREST = "#0d3b2e", FOREST2 = "#145240", LIME = "#c8f560", CREAM = "#f6f3ea", MUTED = "#a9c2b6", BUTTER = "#ffd66b";

  x.fillStyle = FOREST; x.fillRect(0, 0, W, H);
  x.fillStyle = FOREST2; x.beginPath(); x.arc(W - 40, 120, 340, 0, Math.PI * 2); x.fill();

  // logo: speech bubble mark + wordmark
  x.fillStyle = LIME; rr(x, 80, 80, 72, 72, 20); x.fill();
  x.fillStyle = FOREST; rr(x, 98, 96, 36, 28, 8); x.fill();
  x.beginPath(); x.moveTo(106, 120); x.lineTo(106, 136); x.lineTo(120, 122); x.closePath(); x.fill();
  x.textAlign = "left"; x.fillStyle = CREAM; x.font = `800 52px ${head}`; x.fillText("Hotseat", 172, 130);

  x.fillStyle = LIME; x.font = `700 30px ${body}`;
  x.fillText((o.company ? `${o.role} · ${o.company}` : o.role), 80, 260, W - 160);

  const big = String(o.score.overall);
  x.fillStyle = LIME; x.font = `800 380px ${head}`; x.fillText(big, 70, 590);
  const bw = x.measureText(big).width;
  x.fillStyle = MUTED; x.font = `700 100px ${head}`; x.fillText("/10", 90 + bw, 590);
  x.font = "120px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif"; x.textAlign = "right"; x.fillText(o.mood, W - 80, 460);

  x.textAlign = "left"; x.fillStyle = CREAM; x.font = `700 54px ${head}`;
  wrap(x, `“${o.score.verdict}”`, 80, 700, W - 160, 66, 3);

  const cells = Object.entries(o.score.scores), cw = (W - 160 - 3 * 20) / 4;
  cells.forEach(([k, v], i) => {
    const cx = 80 + i * (cw + 20);
    x.fillStyle = FOREST2; rr(x, cx, 940, cw, 190, 32); x.fill();
    x.textAlign = "left"; x.fillStyle = BUTTER; x.font = `800 84px ${head}`; x.fillText(String(v), cx + 26, 1030);
    x.fillStyle = CREAM; x.font = `500 25px ${body}`; x.fillText(k.replace("_", " "), cx + 26, 1090, cw - 40);
  });

  x.fillStyle = CREAM; x.font = `700 34px ${body}`;
  x.fillText(o.name ? `${o.name} just took the hotseat.` : "Just took the hotseat.", 80, 1210);
  x.fillStyle = MUTED; x.font = `500 26px ${body}`;
  x.fillText("Built on Gnani AI voice  ·  #GnaniAI #Hotseat", 80, 1262);
  x.textAlign = "right"; x.fillStyle = LIME; x.font = `700 28px ${body}`;
  x.fillText(location.host, W - 80, 1262);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("render failed"))), "image/png"));
}

function wrap(x: CanvasRenderingContext2D, text: string, px: number, y: number, max: number, lh: number, maxLines: number) {
  const words = text.split(" "); let line = "", n = 0;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (x.measureText(t).width > max && line) { x.fillText(line, px, y + n * lh); line = w; if (++n >= maxLines) return; } else line = t;
  }
  x.fillText(line, px, y + n * lh);
}
function rr(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) {
  x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
}
