import { groqJSON } from "@/lib/groq";
import { scorePrompt, STYLES } from "@/lib/prompts";
import type { StyleKey, Tone } from "@/lib/types";

export const maxDuration = 45;

export async function POST(req: Request) {
  const { style, role, company, tone, transcript } = await req.json();
  if (!(style in STYLES) || !transcript) return Response.json({ error: "Bad request" }, { status: 400 });
  try {
    const r = await groqJSON<object>(
      [{ role: "system", content: scorePrompt(style as StyleKey, role || "Software Engineer", company || "", (tone || "balanced") as Tone) }, { role: "user", content: String(transcript).slice(-16000) }], 3000);
    return Response.json(r);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
