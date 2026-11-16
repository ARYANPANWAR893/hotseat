const FILLERS = ["basically", "like", "actually", "you know", "i mean", "um", "uh", "umm", "matlab", "toh", "so", "kind of", "sort of"];
export function countFillers(text: string): Record<string, number> {
  const t = " " + text.toLowerCase().replace(/[^\p{L}\s']/gu, " ") + " ";
  const out: Record<string, number> = {};
  for (const f of FILLERS) {
    const n = t.split(` ${f} `).length - 1;
    if (n > 0) out[f] = n;
  }
  return out;
}
