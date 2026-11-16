"use client";
import { useEffect, useRef, useState } from "react";
import { renderScorecard } from "@/lib/scorecard";
import { Button, Icon, Portrait, cx, type Who } from "./ui";
import type { Finished } from "./Interview";

const SITES = [
  { name: "LinkedIn", url: (t: string, u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { name: "X", url: (t: string, u: string) => `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
  { name: "WhatsApp", url: (t: string, u: string) => `https://wa.me/?text=${t}%20${u}` },
  { name: "Telegram", url: (t: string, u: string) => `https://t.me/share/url?url=${u}&text=${t}` },
  { name: "Facebook", url: (t: string, u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
];
const LABEL: Record<string, string> = { technical_depth: "Technical depth", clarity: "Clarity", structure: "Structure", confidence: "Confidence" };

function Gauge({ value }: { value: number }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative h-48 w-48 shrink-0" role="img" aria-label={`Overall score ${value} out of 10`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90"><circle cx="60" cy="60" r={r} fill="none" strokeWidth="11" stroke="#145240" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="11" strokeLinecap="round" stroke="#c8f560" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(10, value) / 10)} /></svg>
      <div className="absolute inset-0 grid place-items-center text-center"><div><span className="font-display text-7xl text-cream">{value}</span><span className="block text-sm font-medium text-cream/60">out of 10</span></div></div>
    </div>
  );
}

export default function Result({ f, onHome, onAgain }: { f: Finished; onHome: () => void; onAgain: () => void }) {
  const { score, run, fillers } = f;
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const image = () => renderScorecard({ score: score!, mood: f.mood, company: run.company, role: run.role, name: f.name });
  const save = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: name }).click(); URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!menu) return;
    const close = (e: Event) => { if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", close);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", close); };
  }, [menu]);

  async function downloadCard() { save(await image(), `scorecard-${run.company || "mock"}.png`.replace(/\s+/g, "-")); }
  const text = score ? `I scored ${score.overall}/10 in a mock ${run.company ? run.company + " " : ""}${run.role} interview on Hotseat, an AI interviewer that grills you on your own resume, out loud. Built on Gnani AI voice. #GnaniAI #Hotseat` : "";

  // Web share links can't attach an image, so we copy the image to the clipboard (or download it) and open the composer.
  function shareTo(site: (typeof SITES)[number]) {
    window.open(site.url(encodeURIComponent(text), encodeURIComponent(location.origin)), "_blank", "noopener");
    const blob = image();
    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      .then(() => setNote(`Scorecard image copied. Paste it into your ${site.name} post (Ctrl/Cmd + V).`))
      .catch(async () => { save(await blob, "scorecard.png"); setNote(`Scorecard image downloaded. Attach it to your ${site.name} post.`); });
    setMenu(false);
  }
  async function nativeShare() {
    const file = new File([await image()], "scorecard.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text }); return; } catch (e) { if ((e as Error).name === "AbortError") return; } }
    setMenu(!menu);
  }
  function download() {
    const head = `Hotseat interview transcript\n${run.role}${run.company ? ` at ${run.company}` : ""} · ${new Date(run.date).toLocaleString()}\n${score ? `Score: ${score.overall}/10` : ""}\n\n`;
    save(new Blob([head + f.transcript], { type: "text/plain" }), `interview-${run.company || "mock"}-${new Date(run.date).toISOString().slice(0, 10)}.txt`.replace(/\s+/g, "-"));
  }

  return (
    <div className="space-y-10 rise">
      <div>
        <p className="text-[15px] font-medium text-ink-2">{run.role}{run.company ? ` · ${run.company}` : ""}</p>
        <h2 id="view-title" tabIndex={-1} className="font-display mt-1 text-4xl sm:text-6xl">Your scorecard</h2>
      </div>

      {score ? (
        <section className="space-y-4">
          <div className="grid items-center gap-6 rounded-[2rem] bg-forest p-6 text-cream sm:grid-cols-[auto_1fr] sm:p-10">
            <Gauge value={score.overall} />
            <div>
              <div className="flex items-center gap-3"><Portrait who={(run.tone as Who) || "friendly"} className="h-12 w-12" /><span className="text-3xl" aria-hidden="true">{f.mood}</span></div>
              <p className="font-display mt-3 text-3xl sm:text-4xl">“{score.verdict}”</p>
            </div>
          </div>
          <div className="rounded-3xl bg-paper p-6">
            <ul className="space-y-5">{Object.entries(score.scores).map(([k, v]) => (
              <li key={k}><div className="mb-2 flex items-baseline justify-between"><span className="font-bold">{LABEL[k] ?? k}</span><span className="font-display text-2xl">{v}<span className="text-sm text-ink-2">/10</span></span></div>
                <div className="h-3 rounded-full bg-ink/10"><div className="h-full rounded-full bg-forest" style={{ width: `${Math.min(100, v * 10)}%` }} /></div></li>))}</ul>
            {Object.keys(fillers).length > 0 && (
              <div className="mt-6 border-t border-line pt-5"><p className="mb-2 text-sm font-bold">Filler words you used</p>
                <div className="flex flex-wrap gap-2">{Object.entries(fillers).map(([w, n]) => <span key={w} className="rounded-full bg-butter px-3.5 py-1 text-sm font-bold">“{w}” × {n}</span>)}</div></div>)}
          </div>
        </section>
      ) : <p className="text-ink-2">Couldn&apos;t generate the scorecard this time, but your transcript is ready to download.</p>}

      <div className="relative grid gap-3 sm:grid-cols-3">
        {score && <Button onClick={downloadCard} icon="download">Download scorecard</Button>}
        {score && <Button variant="secondary" onClick={nativeShare} icon="share" aria-expanded={menu} aria-haspopup="menu">Share scorecard</Button>}
        <Button variant="secondary" onClick={download} icon="file" className={cx(!score && "sm:col-span-3")}>Download transcript</Button>
        {menu && (
          <div ref={menuRef} role="menu" aria-label="Share to" className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-3xl bg-paper shadow-xl ring-1 ring-ink/10 sm:left-1/3 sm:right-1/3">
            {SITES.map((st) => <button key={st.name} role="menuitem" onClick={() => shareTo(st)} className="flex min-h-12 w-full cursor-pointer items-center px-5 text-left text-[15px] font-bold hover:bg-lime-soft">{st.name}</button>)}
          </div>)}
      </div>
      {note && <p role="status" className="rounded-2xl bg-lime-soft px-4 py-3 text-center text-sm font-medium text-forest">{note}</p>}

      {score && (
        <>
          <section aria-labelledby="fix"><h3 id="fix" className="font-display mb-4 text-2xl sm:text-3xl">Practise next</h3>
            <ol className="space-y-3">{score.top_fixes?.map((x, i) => <li key={i} className="flex gap-4 rounded-2xl bg-paper p-4"><span aria-hidden="true" className="font-display grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-lg text-forest">{i + 1}</span><span className="pt-1 text-[16px]">{x}</span></li>)}</ol></section>
          <section aria-labelledby="ex"><h3 id="ex" className="font-display mb-4 text-2xl sm:text-3xl">Question by question</h3>
            <div className="space-y-3">{score.questions?.map((q, i) => (
              <details key={i} open={i === 0} className="group rounded-3xl bg-paper">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-bold"><span>{i + 1}. {q.q}</span><Icon name="chevronDown" className="h-5 w-5 transition-transform group-open:rotate-180" /></summary>
                <div className="space-y-3 px-5 pb-5 text-[15px]">
                  <p className="flex gap-2 text-good"><Icon name="check" className="mt-0.5 h-5 w-5" /><span><b>Good:</b> {q.good}</span></p>
                  <p className="flex gap-2 text-bad"><Icon name="x" className="mt-0.5 h-5 w-5" /><span><b>Missing:</b> {q.missing}</span></p>
                  <p className="rounded-2xl bg-lime-soft p-4"><b>A stronger answer:</b> {q.better}</p>
                </div>
              </details>))}</div></section>
        </>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="lime" onClick={onAgain} icon="rotate" className="sm:flex-1">Take the hotseat again</Button>
        <Button variant="secondary" onClick={onHome} icon="grid" className="sm:flex-1">Back to dashboard</Button>
      </div>
    </div>
  );
}
