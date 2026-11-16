"use client";
import { useState } from "react";
import { FAMILIES, familyById, typeById } from "@/lib/onboarding";
import { ActionBar, Button, Choice, FIELD, Label, Portrait } from "./ui";
import type { Profile } from "@/lib/types";

type Answers = Pick<Profile, "name" | "family" | "typeId" | "dream" | "worry">;

// Each answer decides the next question's options: role → company types → companies → worries.
export default function Onboarding({ initial, onDone }: { initial: Profile; onDone: (a: Answers) => void }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({ name: initial.name, family: initial.family, typeId: initial.typeId, dream: initial.dream, worry: initial.worry });
  const [custom, setCustom] = useState("");
  const fam = familyById(a.family);
  const type = typeById(a.family, a.typeId);
  const set = (p: Partial<Answers>) => setA((x) => ({ ...x, ...p }));
  const toggle = (c: string) => setA((x) => ({ ...x, dream: x.dream.includes(c) ? x.dream.filter((d) => d !== c) : x.dream.length < 3 ? [...x.dream, c] : x.dream }));

  const steps = [
    { title: "What should I call you?", hint: "I'll use your name to greet you in interviews.", ok: a.name.trim().length > 0, body: (
      <div><Label htmlFor="nm">Your first name</Label>
        <input id="nm" autoFocus autoComplete="given-name" value={a.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Rahul" className={FIELD} /></div>) },
    { title: "Which kind of role are you aiming for?", hint: "Pick the closest match. You can change it later.", ok: !!fam, body: (
      <div className="grid gap-2.5 sm:grid-cols-2">{FAMILIES.map((f) => <Choice key={f.id} selected={a.family === f.id} onClick={() => set({ family: f.id, typeId: "", dream: [], worry: "" })} title={f.label} />)}</div>) },
    { title: fam?.id === "consulting" ? "Which kind of consulting firm?" : "Which type of company do you want to join?", hint: "This tunes the interviewer's style to how that company really interviews.", ok: !!type, body: (
      <div className="grid gap-2.5 sm:grid-cols-2">{fam?.types.map((t) => <Choice key={t.id} selected={a.typeId === t.id} onClick={() => set({ typeId: t.id, dream: [] })} title={t.label} sub={t.sub} />)}</div>) },
    { title: "Pick your dream companies", hint: `Choose up to 3. Selected ${a.dream.length} of 3.`, ok: a.dream.length > 0, body: (
      <div>
        <div className="grid gap-2.5 sm:grid-cols-2">{[...new Set([...(type?.companies ?? []), ...a.dream])].map((c) => <Choice key={c} selected={a.dream.includes(c)} onClick={() => toggle(c)} title={c} />)}</div>
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (custom.trim()) { toggle(custom.trim()); setCustom(""); } }}>
          <label htmlFor="other" className="sr-only">Add another company</label>
          <input id="other" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Someone else? Type a company" className={FIELD} />
          <Button type="submit" variant="secondary">Add</Button>
        </form>
      </div>) },
    { title: "What worries you most about interviews?", hint: "I'll make sure your practice includes it.", ok: !!a.worry, body: (
      <div className="grid gap-2.5 sm:grid-cols-2">{fam?.worries.map((w) => <Choice key={w} selected={a.worry === w} onClick={() => set({ worry: w })} title={w} />)}</div>) },
  ];
  const cur = steps[step], last = step === steps.length - 1;
  const next = () => (last ? onDone({ ...a, name: a.name.trim() }) : setStep(step + 1));

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (cur.ok) next(); }} className="rise">
      <div className="mb-8 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} aria-label={`Question ${step + 1} of ${steps.length}`}>
        {steps.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-forest" : "bg-ink/10"}`} />)}
      </div>
      <div className="mb-8 flex items-end gap-4 sm:gap-6">
        <Portrait who="friendly" className="h-20 w-20 sm:h-28 sm:w-28" />
        <div className="relative rounded-3xl rounded-bl-md bg-forest px-5 py-4 text-cream sm:px-7 sm:py-5">
          <h2 id="view-title" tabIndex={-1} className="font-display text-3xl sm:text-5xl">{cur.title}</h2>
          <p className="mt-2 text-[16px] text-cream/75">{cur.hint}</p>
        </div>
      </div>
      {cur.body}
      <ActionBar>
        <Button type="button" variant="ghost" icon="arrowLeft" onClick={() => setStep(step - 1)} disabled={step === 0}>Back</Button>
        <Button type="submit" disabled={!cur.ok} iconRight={last ? "check" : "arrowRight"} className="ml-auto flex-1 sm:flex-none sm:min-w-48">{last ? "Finish" : "Continue"}</Button>
      </ActionBar>
    </form>
  );
}
