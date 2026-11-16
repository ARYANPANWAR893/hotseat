import { groqJSON } from "@/lib/groq";
import { planPrompt, STYLES } from "@/lib/prompts";
import type { StyleKey, Tone } from "@/lib/types";

export const maxDuration = 30;

const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

export async function POST(req: Request) {
  const b = await req.json();
  if (!b.resume?.trim() || !(b.style in STYLES)) return Response.json({ error: "Missing resume or style" }, { status: 400 });
  try {
    const plan = await groqJSON<{ candidate_name: string; keyterms?: string[]; topics: { topic: string; angle: string }[] }>(
      [{ role: "user", content: planPrompt({
        style: b.style as StyleKey, role: b.role || "Software Engineer", company: b.company || "", tone: (["friendly", "balanced", "strict"].includes(b.tone) ? b.tone : "balanced") as Tone,
        jd: b.jd || "", resume: b.resume, worry: b.worry || "", lastFixes: Array.isArray(b.lastFixes) ? b.lastFixes.slice(0, 3) : [], vibe: b.vibe || "",
      }) }], 2200);
    if (!Array.isArray(plan.topics) || plan.topics.length < 3) throw new Error("bad plan");
    return Response.json({ candidate_name: plan.candidate_name, keyterms: (plan.keyterms ?? []).slice(0, 15).join(", "), topics: shuffle(plan.topics).slice(0, 10) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
