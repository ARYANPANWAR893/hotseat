import { groqJSON } from "@/lib/groq";
import { turnPrompt, OPENERS, MOVES, STYLES } from "@/lib/prompts";
import type { StyleKey, Tone } from "@/lib/types";

export const maxDuration = 30;

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const mmss = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0")}`;

export async function POST(req: Request) {
  const b = await req.json();
  if (!(b.style in STYLES)) return Response.json({ error: "Bad style" }, { status: 400 });
  const minutes = Math.min(45, Math.max(3, Number(b.minutes) || 10));
  const elapsed = Math.max(0, Number(b.elapsedSec) || 0), remaining = minutes * 60 - elapsed;
  const msgs: { who: string; text: string }[] = Array.isArray(b.messages) ? b.messages.slice(-24) : [];
  const persona = String(b.persona || "the interviewer").slice(0, 40), name = String(b.name || "").slice(0, 40);
  const tone = (["friendly", "balanced", "strict"].includes(b.tone) ? b.tone : "balanced") as Tone;
  const mustWrap = !!b.mustWrap || remaining <= 0;
  const first = msgs.length === 0;
  const timeNote = mustWrap ? "TIME IS UP: close the interview warmly in 2-3 short sentences: acknowledge their last answer in a few words, thank them, wish them luck. Do NOT ask a question. Set wrap=true."
    : remaining < 90 ? "Time is almost up: ask ONE last short question, or wrap up if the last answer was already a good ending. Do not start a new big topic."
    : "Plenty of time left: keep going, wrap=false.";

  const topics: { topic: string; angle: string }[] = Array.isArray(b.topics) ? b.topics.slice(0, 12) : [];
  const covered: string[] = Array.isArray(b.covered) ? b.covered.slice(-15) : [];
  const unused = topics.filter((t) => !covered.some((c) => c.toLowerCase().includes(t.topic.toLowerCase()) || t.topic.toLowerCase().includes(c.toLowerCase())));
  const interrupted = b.interrupted?.planned ? `The candidate INTERRUPTED you. They only heard: "${String(b.interrupted.said || "(nothing)").slice(0, 300)}". You had been about to say: "${String(b.interrupted.planned).slice(0, 400)}".` : "";

  const user = [
    `Candidate name: ${name || "(unknown)"}.`,
    `Topic ideas from their resume (use as inspiration, any order, skip what is already covered):\n${(unused.length ? unused : topics).map((t) => `- ${t.topic}: ${t.angle}`).join("\n")}`,
    covered.length ? `Topics already discussed: ${covered.join("; ")}` : "",
    first ? `This is your FIRST turn: greet them by name, say your name (${persona}), then ${pick(OPENERS)}` : `Transcript so far:\n${msgs.map((m) => `${m.who === "ai" ? persona : "Candidate"}: ${m.text}`).join("\n")}`,
    first || mustWrap ? "" : `Suggested move (override it if their last answer was too vague to move on, then probe that instead): ${pick(MOVES)}`,
    interrupted,
    mustWrap ? "FINAL TURN: the interview is over. Do NOT ask any question. Briefly acknowledge their last answer, thank them, wish them luck." : "",
  ].filter(Boolean).join("\n\n");

  try {
    const r = await groqJSON<{ say: string; rating?: number | null; topic?: string; wrap?: boolean }>([
      { role: "system", content: turnPrompt({ persona, style: b.style as StyleKey, role: b.role || "Software Engineer", company: b.company || "", tone, minutes, elapsed: mmss(elapsed), remaining: mmss(remaining), timeNote }) },
      { role: "user", content: user }], 400);
    const rating = first || r.rating == null ? null : Math.min(5, Math.max(1, Math.round(Number(r.rating) || 3)));
    return Response.json({ say: String(r.say || "").slice(0, 450), rating, topic: String(r.topic || "").slice(0, 80), wrap: mustWrap || (!!r.wrap && remaining <= 90) });
  } catch (e) {
    return Response.json({ say: mustWrap ? "That brings us to the end of our time. Thank you, it was a pleasure speaking with you." : "Sorry, could you say that again?", rating: null, topic: "", wrap: mustWrap, degraded: (e as Error).message });
  }
}
