"use client";
import { useState, type ReactNode } from "react";
import AddResume from "./AddResume";
import { ActionBar, Button, Choice, ErrorBox, FIELD, Icon, Label, Portrait, cx } from "./ui";
import { DURATIONS, FAMILIES, ROLES, TONES, familyById } from "@/lib/onboarding";
import type { Profile, Setup as SetupT, StyleKey, Tone } from "@/lib/types";

export type Plan = { candidate_name: string; keyterms: string; topics: { topic: string; angle: string }[] };
const STYLE_CARDS: { id: StyleKey; name: string; sub: string }[] = [
  { id: "product", name: "Product company", sub: "Metrics, trade-offs, ownership" },
  { id: "service", name: "IT services", sub: "HR round plus CS basics" },
  { id: "startup", name: "Startup", sub: "What did you actually ship?" },
  { id: "consulting", name: "Consulting", sub: "Structure, cases, fit" },
];

function styleFor(company: string, fallback: StyleKey): StyleKey {
  for (const f of FAMILIES) for (const t of f.types) if (t.companies.includes(company)) return t.style;
  return fallback;
}
const Step = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
  <section aria-labelledby={`s${n}`}><h3 id={`s${n}`} className="font-display mb-4 text-2xl sm:text-3xl">{title}</h3>{children}</section>
);

export default function Setup({ p, update, initialCompany, onReady, onBack }: {
  p: Profile; update: (f: (p: Profile) => Profile) => void; initialCompany?: string; onReady: (s: SetupT, plan: Plan) => void; onBack: () => void;
}) {
  const fam = familyById(p.family);
  const famStyle = fam?.types.find((t) => t.id === p.typeId)?.style ?? "product";
  const last = p.lastSetup;
  const [s, setS] = useState<SetupT>({
    resumeId: last?.resumeId && p.resumes.some((r) => r.id === last.resumeId) ? last.resumeId : p.resumes[0]?.id ?? "",
    role: last?.role ?? fam?.role ?? ROLES[0],
    company: initialCompany ?? last?.company ?? p.dream[0] ?? "",
    style: initialCompany ? styleFor(initialCompany, famStyle) : last?.style ?? (p.dream[0] ? styleFor(p.dream[0], famStyle) : famStyle),
    tone: last?.tone ?? "balanced", minutes: last?.minutes ?? 10, jd: "", vibe: "",
  });
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (x: Partial<SetupT>) => setS((v) => ({ ...v, ...x }));
  const pickCompany = (c: string) => set({ company: c, style: styleFor(c, s.style) });
  const companies = [...new Set([...p.dream, ...(fam?.types.find((t) => t.id === p.typeId)?.companies ?? []), ...(s.company ? [s.company] : [])])];
  const resume = p.resumes.find((r) => r.id === s.resumeId);

  async function go() {
    if (!resume) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...s, resume: resume.text, worry: p.worry, lastFixes: p.runs[0]?.fixes ?? [] }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Couldn't prepare the interview");
      update((x) => ({ ...x, lastSetup: { ...s, jd: "", vibe: "" } }));
      onReady(s, d);
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }
  const summary = [resume?.name, s.company || "Any company", TONES.find((t) => t.id === s.tone)?.name, `${s.minutes} min`].filter(Boolean).join(" · ");

  return (
    <div className="space-y-10 rise">
      <div>
        <Button variant="ghost" icon="arrowLeft" onClick={onBack} className="-ml-3 min-h-10">Back</Button>
        <h2 id="view-title" tabIndex={-1} className="font-display mt-2 text-4xl sm:text-6xl">Set up your interview</h2>
        <p className="mt-3 text-[17px] text-ink-2">Four quick choices. Defaults are pre-filled from your last session and goals.</p>
      </div>
      {err && <ErrorBox>{err}</ErrorBox>}

      <Step n={1} title="Choose a resume">
        {p.resumes.length === 0 ? <AddResume onAdd={(name, text) => { const id = crypto.randomUUID(); update((x) => ({ ...x, resumes: [...x.resumes, { id, name, text, added: Date.now() }] })); set({ resumeId: id }); }} /> : (
          <div className="grid gap-2.5 sm:grid-cols-2">{p.resumes.map((r) => <Choice key={r.id} selected={s.resumeId === r.id} onClick={() => set({ resumeId: r.id })} title={r.name} sub={`${r.text.length.toLocaleString()} characters`} />)}</div>)}
      </Step>

      <Step n={2} title="Role and company">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="role">Role</Label>
            <select id="role" value={s.role} onChange={(e) => set({ role: e.target.value })} className={FIELD}>{[...new Set([s.role, ...ROLES])].map((r) => <option key={r}>{r}</option>)}</select></div>
          <div><Label htmlFor="co">Company</Label>
            <input id="co" value={s.company} onChange={(e) => set({ company: e.target.value })} placeholder="Type any company" className={FIELD} /></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{companies.map((c) => (
          <button key={c} onClick={() => pickCompany(c)} aria-pressed={s.company === c}
            className={cx("inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[15px] font-bold transition", s.company === c ? "bg-forest text-cream" : "bg-paper ring-1 ring-inset ring-ink/15 hover:ring-ink/40")}>{s.company === c && <Icon name="check" className="h-4 w-4" />}{c}</button>))}
          <form className="flex" onSubmit={(e) => { e.preventDefault(); if (custom.trim()) { pickCompany(custom.trim()); setCustom(""); } }}>
            <label htmlFor="oth" className="sr-only">Add a company</label>
            <input id="oth" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="+ other" className="min-h-11 w-28 rounded-full bg-paper px-4 text-sm ring-1 ring-inset ring-ink/20" /></form>
        </div>
        <div className="mt-5"><Label hint="Picked automatically from the company. Change it if you like.">Interview style</Label>
          <div className="grid gap-2.5 sm:grid-cols-2">{STYLE_CARDS.map((c) => <Choice key={c.id} selected={s.style === c.id} onClick={() => set({ style: c.id })} title={c.name} sub={c.sub} />)}</div></div>
      </Step>

      <Step n={3} title="Who interviews you?">
        <div className="grid gap-3 sm:grid-cols-3">{TONES.map((t) => (
          <button key={t.id} type="button" onClick={() => set({ tone: t.id as Tone })} aria-pressed={s.tone === t.id}
            className={cx("flex cursor-pointer items-center gap-4 rounded-3xl p-4 text-left transition sm:flex-col sm:items-start sm:gap-3", s.tone === t.id ? "bg-lime-soft ring-2 ring-inset ring-forest" : "bg-paper ring-1 ring-inset ring-ink/15 hover:ring-ink/40")}>
            <Portrait who={t.id as Tone} className="h-20 w-20 sm:h-28 sm:w-28" />
            <span><span className="font-display block text-2xl">{t.persona}</span><span className="block text-[13px] font-bold uppercase tracking-wide text-forest">{t.name}</span><span className="mt-1 block text-[14.5px] text-ink-2">{t.sub}</span></span>
          </button>))}</div>
      </Step>

      <Step n={4} title="How long?">
        <div role="group" aria-label="Interview length" className="grid grid-cols-5 gap-2">{DURATIONS.map((d) => (
          <button key={d.m} onClick={() => set({ minutes: d.m })} aria-pressed={s.minutes === d.m}
            className={`min-h-16 cursor-pointer rounded-2xl px-1 text-center transition ${s.minutes === d.m ? "bg-forest text-cream" : "bg-paper ring-1 ring-inset ring-ink/15 hover:ring-ink/40"}`}>
            <span className="font-display block text-3xl leading-none">{d.m}</span><span className="text-xs font-medium opacity-70">min</span></button>))}</div>
        <p className="mt-2 text-sm text-ink-2">The interviewer keeps going, and adapts to your answers, until time is up.</p>
      </Step>

      <details className="group rounded-3xl bg-paper">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-[15px] font-semibold">Optional: job description and recruiter style<Icon name="chevronDown" className="h-5 w-5 transition-transform group-open:rotate-180" /></summary>
        <div className="space-y-4 px-5 pb-5">
          <div><Label htmlFor="jd">Job description</Label><textarea id="jd" value={s.jd} onChange={(e) => set({ jd: e.target.value })} rows={3} placeholder="Paste the key requirements" className={FIELD} /></div>
          <div><Label htmlFor="vibe" hint="The interviewer borrows their priorities and style, never their name.">A recruiter&apos;s public bio or posts</Label><textarea id="vibe" value={s.vibe} onChange={(e) => set({ vibe: e.target.value })} rows={3} className={FIELD} /></div>
        </div>
      </details>

      <ActionBar>
        <p className="hidden min-w-0 flex-1 truncate text-sm font-medium text-ink-2 sm:block">{summary}</p>
        <Button onClick={go} disabled={!resume} busy={busy} iconRight="arrowRight" className="w-full sm:w-auto sm:min-w-52">{busy ? "Preparing your interview…" : "Prepare my interview"}</Button>
      </ActionBar>
    </div>
  );
}
