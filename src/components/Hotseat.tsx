"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/store";
import Onboarding from "./Onboarding";
import Dashboard from "./Dashboard";
import Setup, { Plan } from "./Setup";
import Interview, { Finished } from "./Interview";
import Result from "./Result";
import { Button, Mark, Wordmark } from "./ui";
import type { Setup as SetupT } from "@/lib/types";

type View = "dashboard" | "onboarding" | "setup" | "interview" | "result";

export default function Hotseat() {
  const [p, update] = useProfile();
  const [view, setView] = useState<View | null>(null);
  const [company, setCompany] = useState<string | undefined>();
  const [live, setLive] = useState<{ s: SetupT; plan: Plan } | null>(null);
  const [done, setDone] = useState<Finished | null>(null);
  const current: View | null = p === null ? null : view ?? (p.onboarded ? "dashboard" : "onboarding");

  // Move focus to the new screen's heading so keyboard and screen-reader users land in the right place.
  useEffect(() => { if (current && current !== "interview") document.getElementById("view-title")?.focus(); }, [current]);

  const dark = current === "interview";
  return (
    <div className={`flex flex-col ${dark ? "on-dark h-dvh overflow-hidden bg-forest text-cream" : "min-h-dvh"}`}>
      <header className={dark ? "" : "sticky top-0 z-30 bg-cream/90 backdrop-blur"}>
        <div className={`mx-auto flex w-full ${dark ? "h-14" : "h-[72px]"} max-w-5xl items-center justify-between px-4 sm:px-8`}>
          <h1 className="m-0 flex items-center gap-2.5"><Mark dark={dark} /><Wordmark className={dark ? "text-[26px] text-cream" : "text-[26px]"} /></h1>
          {p?.onboarded && current !== "dashboard" && current !== "interview" && <Button variant="ghost" icon="grid" onClick={() => setView("dashboard")} className="min-h-10 px-4">Dashboard</Button>}
        </div>
      </header>

      <main className={`mx-auto w-full max-w-5xl flex-1 px-4 sm:px-8 ${dark ? "min-h-0 overflow-y-auto pb-3 pt-1" : "pb-32 pt-4 sm:pt-8"}`}>
        {p === null && <p className="py-24 text-center text-ink-2" role="status">Loading…</p>}
        {p && current === "onboarding" && <Onboarding initial={p} onDone={(a) => { update((x) => ({ ...x, ...a, onboarded: true })); setView("dashboard"); }} />}
        {p && current === "dashboard" && <Dashboard p={p} update={update} onEdit={() => setView("onboarding")} onStart={(c) => { setCompany(c); setView("setup"); }} />}
        {p && current === "setup" && <Setup p={p} update={update} initialCompany={company} onBack={() => setView("dashboard")} onReady={(s, plan) => { setLive({ s, plan }); setView("interview"); }} />}
        {p && current === "interview" && live && <Interview p={p} s={live.s} plan={live.plan} onExit={() => setView("dashboard")}
          onFinish={(f) => { update((x) => ({ ...x, runs: [f.run, ...x.runs].slice(0, 30) })); setDone(f); setView("result"); }} />}
        {current === "result" && done && <Result f={done} onHome={() => setView("dashboard")} onAgain={() => setView("setup")} />}
      </main>
      {!dark && <footer className="pb-24 text-center text-xs text-ink-2">Voice by Gnani AI · Your data never leaves this browser</footer>}
    </div>
  );
}
