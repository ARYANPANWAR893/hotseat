export type StyleKey = "product" | "service" | "startup" | "consulting";
export type Tone = "friendly" | "balanced" | "strict";

export type Resume = { id: string; name: string; text: string; added: number };
export type Score = {
  overall: number; verdict: string;
  scores: { technical_depth: number; clarity: number; structure: number; confidence: number };
  questions: { q: string; good: string; missing: string; better: string }[];
  top_fixes: string[];
};
export type Run = {
  id: string; date: number; role: string; company: string; style: StyleKey; tone: Tone;
  overall: number; scores: Score["scores"]; fixes: string[]; verdict: string; moodAvg: number;
};
export type Setup = { resumeId: string; role: string; company: string; style: StyleKey; tone: Tone; minutes: number; jd: string; vibe: string };
export type Profile = {
  onboarded: boolean; name: string; family: string; typeId: string; dream: string[]; worry: string;
  resumes: Resume[]; runs: Run[]; lastSetup?: Setup;
};
