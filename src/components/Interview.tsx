"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { startListening, Listener } from "@/lib/wav";
import { countFillers } from "@/lib/fillers";
import { TONES } from "@/lib/onboarding";
import { Avatar, Bars, Button, Icon, Portrait, cx, type Who } from "./ui";
import type { Plan } from "./Setup";
import type { Profile, Run, Score, Setup } from "@/lib/types";

type Msg = { who: "ai" | "you"; text: string };
type Status = "speaking" | "thinking" | "idle";
type Speaking = { text: string; msg: Msg; interrupted: boolean; audio: HTMLAudioElement | null; resolve: () => void };
type TurnRes = { say: string; rating: number | null; topic: string; wrap: boolean };
export type Finished = { run: Run; score: Score | null; fillers: Record<string, number>; transcript: string; mood: string; name: string };

const FACES = ["😡", "😕", "😐", "😊", "💎"];
const LABELS = ["Not impressed at all", "Unconvinced", "Warming up", "Liking this", "Absolutely crushing it"];
export function moodIndex(m: number | null, all4: boolean): number {
  if (m === null) return 2;
  if (m >= 4.5 && all4) return 4;
  return m < 1.7 ? 0 : m < 2.6 ? 1 : m < 3.5 ? 2 : 3;
}
const scoreFace = (v: number) => (v < 3 ? 0 : v < 5 ? 1 : v < 6.5 ? 2 : v < 8.5 ? 3 : 4);
const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
  return d;
}

export default function Interview({ p, s, plan, onFinish, onExit }: { p: Profile; s: Setup; plan: Plan; onFinish: (f: Finished) => void; onExit: () => void }) {
  const tone = TONES.find((t) => t.id === s.tone)!;
  const name = p.name || plan.candidate_name || "there";
  const limit = s.minutes * 60;
  const [started, setStarted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [caption, setCaption] = useState(false);
  const [status, setStatusState] = useState<Status>("idle");
  const [micOn, setMicOn] = useState(false);
  const [hearing, setHearingState] = useState(false);
  const [lvl, setLvl] = useState(0);
  const [err, setErr] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [rated, setRated] = useState<number[]>([]);
  const [scoring, setScoring] = useState(false);
  const [cam, setCam] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const listener = useRef<Listener | null>(null);
  const t0 = useRef(0);
  const statusRef = useRef<Status>("idle");
  const hearingRef = useRef(false);
  const speaking = useRef<Speaking | null>(null);
  const all = useRef<Msg[]>([]);
  const ratings = useRef<number[]>([]);
  const covered = useRef<string[]>([]);
  const parts = useRef<string[]>([]);       // transcribed utterances not yet answered
  const inflight = useRef(0);               // utterances being processed or queued
  const gen = useRef(0);                    // bumps on every new utterance; stale replies are dropped
  const queue = useRef<Promise<void>>(Promise.resolve());
  const interruptedRef = useRef<{ said: string; planned: string } | null>(null);
  const wrapStarted = useRef(false);
  const finished = useRef(false);
  const closingLine = useRef(false);        // the farewell is playing: nothing may cut it off
  const video = useRef<HTMLVideoElement>(null);
  const camStream = useRef<MediaStream | null>(null);
  const endRef = useRef<HTMLDivElement>(null); // the caption box
  const latest = useRef<{ closing: () => void }>({ closing: () => {} });

  const setStatus = (v: Status) => { statusRef.current = v; setStatusState(v); };
  const setHearing = (v: boolean) => { hearingRef.current = v; setHearingState(v); };
  const face = moodIndex(mood, rated.length > 0 && rated.every((r) => r >= 4));
  const sync = () => setMsgs([...all.current]);

  useEffect(() => { const el = endRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [msgs, caption]); // scrolls only the caption box, never the page
  useEffect(() => {
    if (!micOn) return;
    const t = setInterval(() => setLvl(listener.current?.level() ?? 0), 80);
    return () => clearInterval(t);
  }, [micOn]);
  useEffect(() => { if (cam && video.current) video.current.srcObject = camStream.current; }, [cam]);
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => {
      const e = (Date.now() - t0.current) / 1000;
      setElapsed(e);
      // time is up and nothing is going on: close the interview ourselves
      if (e >= limit + 12 && statusRef.current === "idle" && !hearingRef.current && inflight.current === 0 && !wrapStarted.current) latest.current.closing();
    }, 1000);
    return () => clearInterval(t);
  }, [started, limit]);
  useEffect(() => () => {
    listener.current?.stop(); camStream.current?.getTracks().forEach((t) => t.stop()); speaking.current?.audio?.pause();
  }, []);

  const say = useCallback(async (text: string) => {
    const msg: Msg = { who: "ai", text };
    all.current.push(msg); sync();
    const sp: Speaking = { text, msg, interrupted: false, audio: null, resolve: () => {} };
    speaking.current = sp; setStatus("speaking");
    try {
      const r = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, voice: tone.voice }) });
      if (!r.ok) throw new Error("tts");
      const blob = await r.blob();
      if (!sp.interrupted) {
        const url = URL.createObjectURL(blob);
        const a = new Audio(url); sp.audio = a;
        await new Promise<void>((res) => { sp.resolve = res; a.onended = () => res(); a.onerror = () => res(); a.play().catch(() => res()); });
        URL.revokeObjectURL(url);
      }
    } catch { /* voice failed: captions still work */ }
    if (speaking.current === sp) speaking.current = null;
    setStatus("idle");
  }, [tone.voice]);

  // The candidate started talking over the interviewer: cut the voice, keep only what was actually said.
  function interrupt() {
    const sp = speaking.current;
    if (!sp || sp.interrupted || closingLine.current) return;
    sp.interrupted = true;
    const a = sp.audio, frac = a && a.duration ? a.currentTime / a.duration : 0;
    a?.pause();
    const words = sp.text.split(/\s+/), said = words.slice(0, Math.floor(words.length * frac)).join(" ");
    interruptedRef.current = { said, planned: sp.text };
    sp.msg.text = said ? `${said} —` : "(interrupted before speaking)";
    sync(); sp.resolve();
  }

  async function runTurn(mustWrap: boolean) {
    const myGen = gen.current;
    setStatus("thinking");
    const t = await post<TurnRes>("/api/turn", {
      style: s.style, role: s.role, company: s.company, tone: s.tone, persona: tone.persona, name, topics: plan.topics, covered: covered.current,
      minutes: s.minutes, elapsedSec: (Date.now() - t0.current) / 1000, mustWrap,
      messages: all.current.map((m) => ({ who: m.who, text: m.text })), interrupted: interruptedRef.current,
    });
    if (finished.current) return;                                         // they pressed End while this reply was being prepared
    for (let i = 0; i < 150 && hearingRef.current; i++) await sleep(100); // let them finish talking
    if (gen.current !== myGen) { setStatus("idle"); return; }             // they said more: that answer supersedes this reply
    interruptedRef.current = null;
    if (t.rating) { ratings.current.push(t.rating); setRated((x) => [...x, t.rating!]); setMood((prev) => (prev === null ? t.rating! : 0.5 * t.rating! + 0.5 * prev)); }
    if (t.topic) covered.current.push(t.topic);
    if (t.wrap) closingLine.current = true;
    await say(t.say);
    if (t.wrap) { await sleep(2000); await finish(); } // let the goodbye land before the marking screen
  }

  async function processUtterance(chunks: Blob[]) {
    setStatus("thinking"); setErr("");
    const texts: string[] = [];
    for (const c of chunks) { // sequential: Gnani may allow 1 active request
      const fd = new FormData(); fd.append("audio_file", c, "a.wav"); fd.append("keyterms", plan.keyterms);
      const r = await fetch("/api/stt", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      texts.push(d.transcript);
    }
    const text = texts.join(" ").trim();
    if (text) parts.current.push(text);
    else if (!interruptedRef.current) { if (inflight.current <= 1) setStatus("idle"); return; } // just noise
    if (inflight.current > 1) return; // more speech already queued: it will answer for both
    const answer = parts.current.join(" ").trim() || "(inaudible)";
    parts.current = [];
    all.current.push({ who: "you", text: answer }); sync();
    await runTurn(false);
  }

  function onUtterance(chunks: Blob[]) {
    if (closingLine.current) return; // the interview is ending; ignore stray speech
    inflight.current++; gen.current++;
    queue.current = queue.current.then(() => processUtterance(chunks)).catch((e) => { setErr((e as Error).message); setStatus("idle"); }).finally(() => { inflight.current--; });
  }

  async function startMic() {
    try {
      listener.current = await startListening({
        onSpeechStart: () => { setHearing(true); interrupt(); },
        onSpeechEnd: () => setHearing(false),
        onUtterance,
        isStrict: () => !!speaking.current && !speaking.current.interrupted,
      });
      setMicOn(true); setErr("");
    } catch { setMicOn(false); setErr("Microphone blocked. Allow mic access in your browser, then press the mic button."); }
  }
  function toggleMic() {
    if (micOn) { listener.current?.stop(); listener.current = null; setMicOn(false); setHearing(false); } else void startMic();
  }

  async function toggleCam() {
    if (cam) { camStream.current?.getTracks().forEach((t) => t.stop()); camStream.current = null; return setCam(false); }
    try { camStream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }); setCam(true); }
    catch { setErr("Camera blocked. Your avatar will be shown instead."); }
  }

  async function begin() {
    t0.current = Date.now(); setStarted(true);
    void startMic(); // a click just happened, so the browser allows the mic prompt; it then stays on until you mute
    try { await runTurn(false); } catch (e) { setErr((e as Error).message); setStatus("idle"); }
  }

  const closing = useCallback(async () => {
    if (wrapStarted.current) return;
    wrapStarted.current = true;
    try { await runTurn(true); } catch { await finish(); }
  // runTurn/finish only read refs and constant props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { latest.current = { closing }; });

  async function finish() {
    if (finished.current) return;
    finished.current = true;
    speaking.current?.audio?.pause(); listener.current?.stop(); listener.current = null; setMicOn(false); setScoring(true);
    const mine = all.current.filter((m) => m.who === "you" && m.text !== "(inaudible)");
    if (!mine.length) return onExit();
    const lines = all.current.map((m) => `${m.who === "ai" ? tone.persona : name}: ${m.text}`).join("\n\n");
    const fillers = countFillers(mine.map((m) => m.text).join(" "));
    const r = ratings.current;
    const moodAvg = r.length ? r.reduce((a, b) => a + b, 0) / r.length : 3;
    let score: Score | null = null;
    try { score = await post<Score>("/api/score", { style: s.style, role: s.role, company: s.company, tone: s.tone, transcript: lines.replaceAll(`${tone.persona}:`, "Interviewer:").replaceAll(`${name}:`, "Candidate:") }); }
    catch (e) { setErr((e as Error).message); }
    const run: Run = { id: crypto.randomUUID(), date: Date.now(), role: s.role, company: s.company, style: s.style, tone: s.tone,
      overall: score?.overall ?? 0, scores: score?.scores ?? { technical_depth: 0, clarity: 0, structure: 0, confidence: 0 }, fixes: score?.top_fixes ?? [], verdict: score?.verdict ?? "", moodAvg };
    onFinish({ run, score, fillers, transcript: lines, mood: FACES[score ? scoreFace(score.overall) : moodIndex(moodAvg, r.every((x) => x >= 4))], name }); // final face follows the final score so the shared card is consistent
  }

  if (scoring) return (
    <div className="py-24 text-center" role="status" aria-live="polite">
      <Portrait who={tone.id as Who} className="pop mx-auto mb-5 h-36 w-36" />
      <h2 id="view-title" tabIndex={-1} className="font-display text-4xl sm:text-6xl">Marking your answers…</h2>
      <p className="mt-2 text-cream/70">{tone.persona} is writing up your feedback. A few seconds.</p>
    </div>
  );

  const who = tone.id as Who;
  if (!started) return (
    <div className="mx-auto max-w-2xl space-y-8 rise">
      <div className="flex items-center gap-5">
        <Portrait who={who} className="h-28 w-28 sm:h-36 sm:w-36" />
        <div>
          <p className="text-[15px] font-medium text-lime">{s.minutes} minutes · {tone.name} · {s.company || s.role}</p>
          <h2 id="view-title" tabIndex={-1} className="font-display mt-1 text-4xl sm:text-6xl">{tone.persona} is ready for you.</h2>
        </div>
      </div>
      <ul className="space-y-3">
        {([["mic", "Your mic stays on", "Just talk, like a real call. Mute if you need a moment."], ["hand", "Interrupt any time", "Speak over the interviewer and they stop and listen."], ["clock", "Timed and adaptive", "Questions follow your answers until the clock runs out."], ["headphones", "Wear headphones", "Otherwise the interviewer's voice leaks back in as yours."]] as const).map(([ic, t, d]) => (
          <li key={t} className="flex items-center gap-4 rounded-2xl bg-forest-2 p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime text-forest"><Icon name={ic} /></span><div><p className="font-bold leading-tight">{t}</p><p className="text-sm text-cream/70">{d}</p></div></li>))}
      </ul>
      {err && <div role="alert" className="rounded-2xl bg-coral/20 px-4 py-3 text-sm text-cream">{err}</div>}
      <Button variant="lime" onClick={begin} icon="play" className="w-full sm:w-auto sm:min-w-56">Begin interview</Button>
    </div>
  );

  const left = limit - elapsed, low = left < 60, over = left <= 0;
  const speakingNow = status === "speaking";
  const label = speakingNow ? `${tone.persona} is speaking. Just talk to interrupt.` : hearing ? "I can hear you…" : status === "thinking" ? `${tone.persona} is thinking…` : micOn ? "Your turn. Your mic is on, just speak." : "Your mic is muted. Unmute to answer.";
  const recent = msgs.slice(-6);
  const round = "grid h-14 w-14 cursor-pointer place-items-center rounded-full transition active:scale-95";
  return (
    <div className="rise flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 id="view-title" tabIndex={-1} className="flex items-center gap-2 text-[15px] font-bold"><span aria-hidden="true" className="live-dot h-2.5 w-2.5 rounded-full bg-lime" />Live with {tone.persona}<span className="font-medium text-cream/60"> · {s.company || s.role}</span></h2>
        <div className="flex items-center gap-2">
          <span role="img" aria-label={`Interviewer's impression: ${LABELS[face]}`} className="flex items-center gap-1.5 rounded-full bg-forest-2 px-3 py-1.5 text-sm font-medium"><span aria-hidden="true" className="pop text-lg" key={face}>{FACES[face]}</span>{LABELS[face]}</span>
          <span role="timer" aria-label={`Elapsed ${fmt(elapsed)} of ${fmt(limit)}`} className={cx("rounded-full px-3.5 py-1.5 text-sm font-bold tabular-nums", low ? "bg-coral text-ink" : "bg-lime text-ink")}>{fmt(elapsed)} <span className="font-medium opacity-60">/ {fmt(limit)}</span></span>
        </div>
      </div>
      {over && <p className="shrink-0 text-center text-sm text-coral" role="status">Time is up. Wrapping up the interview…</p>}

      <div className="relative min-h-0 flex-1">
        <div className="grid h-full place-items-center rounded-[2rem] bg-forest-2 px-4 py-4">
          <div className="text-center">
            <Portrait who={who} speaking={speakingNow} className={cx("mx-auto h-[clamp(6rem,27dvh,17rem)] w-[clamp(6rem,27dvh,17rem)] transition-shadow", speakingNow && "shadow-[0_0_0_6px_#145240,0_0_0_10px_#c8f560]")} />
            <p className="font-display mt-3 text-2xl sm:text-3xl">{tone.persona}</p>
            <div className="mt-2 flex h-8 items-center justify-center">{speakingNow ? <Bars active className="h-7 text-lime" /> : <p className="text-sm text-cream/70">{status === "thinking" ? "Thinking…" : "Listening"}</p>}</div>
          </div>
        </div>
        <div className={cx("absolute right-3 top-3 grid h-24 w-20 place-items-center overflow-hidden rounded-2xl bg-forest text-center transition sm:bottom-3 sm:top-auto sm:h-44 sm:w-36 sm:rounded-3xl", hearing ? "ring-4 ring-lime" : "ring-2 ring-cream/20")}>
          {cam && <video ref={video} autoPlay muted playsInline aria-label="Your camera preview" className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />}
          {!cam && <div><Avatar name={name} className="mx-auto h-9 w-9 text-lg sm:h-16 sm:w-16 sm:text-3xl" /><p className="mt-2 hidden text-sm font-bold sm:block">You</p><Bars level={micOn ? lvl : 0} n={7} className="mx-auto mt-1 hidden h-5 text-lime sm:flex" /></div>}
          <span className={cx("absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold", !micOn ? "bg-coral text-ink" : hearing ? "bg-lime text-ink" : "bg-ink/70 text-cream")}>{!micOn ? "Muted" : hearing ? "Hearing you" : "Mic on"}</span>
        </div>
      </div>

      {err && <div role="alert" className="shrink-0 rounded-2xl bg-coral/20 px-4 py-2 text-sm text-cream">{err}</div>}
      <p role="status" aria-live="polite" className="shrink-0 text-center text-[15px] text-cream/80">{label}</p>
      {hearing && <div className="shrink-0 text-center"><Button variant="lime" className="min-h-10 text-sm" onClick={() => listener.current?.flush()}>I&apos;m done, send my answer</Button></div>}

      {caption && (
        <div ref={endRef} className="h-28 shrink-0 space-y-2 overflow-y-auto rounded-3xl bg-forest-2 p-4 text-sm">
          {recent.length === 0 && <p className="text-cream/60">Captions will appear here.</p>}
          {recent.map((m, i) => <p key={i}><b className={m.who === "ai" ? "text-lime" : "text-butter"}>{m.who === "ai" ? tone.persona : "You"}:</b> {m.text}</p>)}
        </div>
      )}

      <div className="shrink-0" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-4">
          <button onClick={toggleMic} aria-pressed={micOn} aria-label={micOn ? "Mute microphone" : "Unmute microphone"} style={{ boxShadow: micOn ? `0 0 0 ${lvl * 8}px rgba(200,245,96,0.35)` : undefined }} className={cx(round, micOn ? "bg-lime text-ink" : "bg-coral text-ink")}><Icon name={micOn ? "mic" : "micOff"} /></button>
          <button onClick={toggleCam} aria-pressed={cam} aria-label={cam ? "Turn camera off" : "Turn camera on"} className={cx(round, cam ? "bg-cream text-ink" : "bg-forest-2 text-cream ring-1 ring-cream/25")}><Icon name={cam ? "video" : "videoOff"} /></button>
          <button onClick={() => setCaption(!caption)} aria-pressed={caption} aria-label="Captions" className={cx(round, caption ? "bg-cream text-ink" : "bg-forest-2 text-cream ring-1 ring-cream/25")}><Icon name="captions" /></button>
          <button onClick={() => void finish()} className="ml-2 inline-flex h-14 cursor-pointer items-center gap-2 rounded-full bg-coral px-6 text-[15px] font-bold text-ink transition active:scale-95"><Icon name="flag" />End</button>
        </div>
      </div>
    </div>
  );
}
