"use client";
import { useState } from "react";
import AddResume from "./AddResume";
import { Button, Card, Icon, Portrait, type Who } from "./ui";
import { typeById } from "@/lib/onboarding";
import type { Profile } from "@/lib/types";

const TILE = ["bg-butter", "bg-mint", "bg-blush"];

function Trend({ scores }: { scores: number[] }) {
  const W = 600, H = 150, pad = 14;
  const pts = scores.map((v, i) => [pad + (scores.length === 1 ? (W - 2 * pad) / 2 : (i * (W - 2 * pad)) / (scores.length - 1)), H - pad - (v / 10) * (H - 2 * pad)]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full" role="img" aria-label={`Scores of your last ${scores.length} interviews: ${scores.join(", ")} out of 10`}>
      {[0, 5, 10].map((g) => <line key={g} x1="0" x2={W} y1={H - pad - (g / 10) * (H - 2 * pad)} y2={H - pad - (g / 10) * (H - 2 * pad)} stroke="#e2ddcf" strokeDasharray="4 6" />)}
      {pts.length > 1 && <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke="#0d3b2e" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 9 : 6} fill={i === pts.length - 1 ? "#c8f560" : "#0d3b2e"} stroke="#0d3b2e" strokeWidth="4" />)}
    </svg>
  );
}

export default function Dashboard({ p, update, onStart, onEdit }: { p: Profile; update: (f: (p: Profile) => Profile) => void; onStart: (company?: string) => void; onEdit: () => void }) {
  const [adding, setAdding] = useState(false);
  const runs = p.runs, last = runs[0];
  const best = runs.length ? Math.max(...runs.map((r) => r.overall)) : null;
  const type = typeById(p.family, p.typeId);
  const trend = [...runs].slice(0, 8).reverse().map((r) => r.overall);
  const showForm = adding || p.resumes.length === 0;
  const who: Who = (last?.tone as Who) || "friendly";
  const stats = [["Interviews", String(runs.length), ""], ["Best score", `${best}`, "out of 10"], ["Latest", `${last?.overall}`, last?.company || last?.role || ""]];

  return (
    <div className="space-y-10 rise">
      <section aria-label="Start an interview" className="relative overflow-hidden rounded-[2rem] bg-forest p-6 text-cream sm:p-10">
        <div className="relative z-10 max-w-xl">
          <Portrait who={who} className="mb-5 h-20 w-20 sm:hidden" />
          <p className="text-[15px] font-medium text-lime">{type ? `${type.label} roles` : "Hotseat"}{p.worry ? ` · working on ${p.worry.toLowerCase()}` : ""}</p>
          <h2 id="view-title" tabIndex={-1} className="font-display mt-2 text-[44px] sm:text-6xl">{runs.length ? `Hi ${p.name}, ready for round ${runs.length + 1}?` : `Hi ${p.name}, let's get you in the hotseat.`}</h2>
          <p className="mt-4 max-w-md text-[17px] text-cream/80">
            {last ? <>Last time at {last.company || last.role} you scored <b className="text-cream">{last.overall}/10</b>.{last.fixes[0] ? <> Today I&apos;ll push on this: {last.fixes[0].replace(/\.$/, "").toLowerCase()}.</> : null}</> : "Pick 5 to 30 minutes. I'll interview you on your own resume, out loud."}
          </p>
          <Button variant="lime" className="mt-7 w-full sm:w-auto sm:min-w-56" iconRight="arrowRight" onClick={() => onStart()}>{p.resumes.length ? "Start an interview" : "Add a resume, then start"}</Button>
        </div>
        <Portrait who={who} className="pointer-events-none absolute -bottom-10 -right-6 hidden h-80 w-80 sm:block" />
      </section>

      {p.dream.length > 0 && (
        <section aria-labelledby="dream"><h3 id="dream" className="font-display mb-4 text-2xl">Practise for a dream company</h3>
          <div className="flex flex-wrap gap-3">{p.dream.map((c) => (
            <button key={c} onClick={() => onStart(c)} className="inline-flex min-h-14 cursor-pointer items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-5 text-[16px] font-bold ring-1 ring-inset ring-ink/10 transition hover:ring-forest">
              <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-lime font-display text-lg text-forest">{c.charAt(0)}</span>{c}<Icon name="arrowRight" className="h-4 w-4 text-ink-2" /></button>))}</div>
        </section>
      )}

      {runs.length > 0 && (
        <section aria-labelledby="prog" className="space-y-4">
          <h3 id="prog" className="font-display text-2xl">Your progress</h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">{stats.map(([l, v, sub], i) => (
            <div key={l} className={`rounded-3xl p-4 sm:p-6 ${TILE[i]}`}><p className="text-sm font-bold text-ink/70">{l}</p><p className="font-display mt-1 text-5xl sm:text-6xl">{v}</p><p className="truncate text-sm text-ink/70">{sub || " "}</p></div>))}</div>
          <Card className="space-y-1">
            <Trend scores={trend} />
            <ul className="divide-y divide-line">{runs.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3"><span className="min-w-0 truncate"><span className="font-bold">{r.company || r.role}</span> <span className="text-sm text-ink-2">· {new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span></span><b className="font-display text-xl">{r.overall}<span className="text-sm text-ink-2">/10</span></b></li>))}</ul>
          </Card>
        </section>
      )}

      <section aria-labelledby="res">
        <div className="mb-4 flex items-center justify-between"><h3 id="res" className="font-display text-2xl">Your resumes</h3>
          {!showForm && <Button variant="secondary" icon="plus" className="min-h-11" onClick={() => setAdding(true)}>Add resume</Button>}</div>
        {p.resumes.length > 0 && <ul className="mb-4 space-y-2">{p.resumes.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-soft text-forest"><Icon name="file" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate font-bold">{r.name}</span><span className="text-sm text-ink-2">{r.text.length.toLocaleString()} characters</span></span>
            <button aria-label={`Delete ${r.name}`} onClick={() => { if (confirm(`Delete "${r.name}"?`)) update((x) => ({ ...x, resumes: x.resumes.filter((y) => y.id !== r.id) })); }} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-ink-2 hover:bg-bad/10 hover:text-bad"><Icon name="trash" /></button>
          </li>))}</ul>}
        {p.resumes.length === 0 && <p className="mb-4 text-[15px] text-ink-2">Add at least one resume so the interviewer can ask about your real projects. Keep several, for example one per role.</p>}
        {showForm && <AddResume onCancel={p.resumes.length ? () => setAdding(false) : undefined} onAdd={(name, text) => { update((x) => ({ ...x, resumes: [...x.resumes, { id: crypto.randomUUID(), name, text, added: Date.now() }] })); setAdding(false); }} />}
      </section>

      <div className="flex gap-2">
        <Button variant="ghost" className="min-h-10 text-sm" onClick={onEdit}>Edit my goals</Button>
        <Button variant="ghost" className="min-h-10 text-sm" onClick={() => { if (confirm("Delete all your saved data from this browser?")) update(() => ({ onboarded: false, name: "", family: "", typeId: "", dream: [], worry: "", resumes: [], runs: [] })); }}>Clear my data</Button>
      </div>
    </div>
  );
}
