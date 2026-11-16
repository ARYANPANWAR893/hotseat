"use client";
import { useState } from "react";
import { Button, Card, ErrorBox, FIELD, Label } from "./ui";

export default function AddResume({ onAdd, onCancel }: { onAdd: (name: string, text: string) => void; onCancel?: () => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(f: File) {
    setErr(""); setBusy(true);
    const fd = new FormData(); fd.append("file", f);
    try {
      const r = await fetch("/api/resume", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setText(d.text);
      if (!name) setName(f.name.replace(/\.pdf$/i, ""));
    } catch (e) { setErr((e as Error).message || "Upload failed. Paste the text instead."); }
    setBusy(false);
  }

  return (
    <Card className="space-y-4">
      <div>
        <Label htmlFor="pdf" hint="PDF up to 4 MB. We read the text in your browser session and keep it only on this device.">Upload your resume</Label>
        <input id="pdf" type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="block w-full cursor-pointer text-sm text-ink-2 file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest file:px-5 file:text-sm file:font-bold file:text-cream" />
      </div>
      <div>
        <Label htmlFor="rtxt" hint="Or paste it here. We need at least a few lines.">Resume text</Label>
        <textarea id="rtxt" value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={busy ? "Reading your PDF…" : "Paste your resume text"} className={FIELD} />
      </div>
      <div>
        <Label htmlFor="rname">Name this resume</Label>
        <input id="rname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SDE resume, Consulting resume" className={FIELD} />
      </div>
      {err && <ErrorBox>{err}</ErrorBox>}
      <div className="flex gap-2">
        <Button disabled={text.trim().length < 50} busy={busy} onClick={() => { onAdd(name.trim() || "My resume", text.trim()); setName(""); setText(""); }}>Save resume</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </Card>
  );
}
