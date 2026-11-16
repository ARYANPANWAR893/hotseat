// Hands-free microphone with simple voice-activity detection (VAD) and barge-in support.
// Gnani STT rejects webm and caps clips at 30 s, so each utterance is captured as PCM,
// downsampled to 16 kHz mono and cut into ≤25 s WAV chunks.
const TARGET_RATE = 16000;
const CHUNK_SECONDS = 25;
const END_SILENCE = 1.6; // seconds of quiet that end an answer
const MIN_SPEECH = 0.6;  // ignore blips shorter than this

export type Listener = { stop: () => void; flush: () => void; level: () => number };

export async function startListening(o: {
  onSpeechStart: () => void; onSpeechEnd: () => void; onUtterance: (chunks: Blob[]) => void;
  isStrict: () => boolean; // true while the interviewer is talking: demand louder/longer speech to count as an interruption (echo guard)
}): Promise<Listener> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const ctx = new AudioContext();
  const inRate = ctx.sampleRate;
  const src = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1); // ponytail: deprecated but universal; AudioWorklet if it ever breaks
  const frameSec = 4096 / inRate;

  let floor = 0.01, calib = 0, calibSum = 0, rms = 0, loud = 0, speaking = false, voiced = 0, silence = 0;
  let pre: Float32Array[] = [], frames: Float32Array[] = [];

  const end = () => {
    const drop = Math.max(0, Math.floor((silence - 0.4) / frameSec)); // trim trailing silence, keep 0.4 s
    const done = frames.slice(0, frames.length - drop), speechSec = voiced * frameSec;
    speaking = false; frames = []; loud = 0; voiced = 0; silence = 0;
    o.onSpeechEnd();
    if (speechSec >= MIN_SPEECH) { const chunks = encode(done, inRate); if (chunks.length) o.onUtterance(chunks); }
  };

  proc.onaudioprocess = (e) => {
    const f = new Float32Array(e.inputBuffer.getChannelData(0));
    let sum = 0; for (const v of f) sum += v * v;
    rms = Math.sqrt(sum / f.length);
    if (calib < 6) { calibSum += rms; if (++calib === 6) floor = Math.min(0.05, calibSum / 6); return; } // measure room noise first
    const strict = o.isStrict();
    const thr = strict ? Math.max(0.045, floor * 7) : Math.max(0.02, floor * 3.5);
    const above = rms > thr;
    if (!speaking) {
      pre.push(f); if (pre.length > 5) pre.shift();
      if (above) loud++; else { loud = 0; floor = floor * 0.95 + rms * 0.05; }
      if (loud >= (strict ? 4 : 2)) { speaking = true; frames = pre; pre = []; voiced = loud; silence = 0; o.onSpeechStart(); }
    } else {
      frames.push(f);
      if (above) { silence = 0; voiced++; } else silence += frameSec;
      if (silence >= END_SILENCE || frames.length * frameSec > 60) end();
    }
  };
  src.connect(proc); proc.connect(ctx.destination);

  return {
    level: () => Math.min(1, rms * 8),
    flush: () => { if (speaking) end(); },
    stop: () => { proc.disconnect(); src.disconnect(); stream.getTracks().forEach((t) => t.stop()); ctx.close(); speaking = false; },
  };
}

function encode(parts: Float32Array[], inRate: number): Blob[] {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const all = new Float32Array(total);
  let o = 0;
  for (const p of parts) { all.set(p, o); o += p.length; }
  const ratio = inRate / TARGET_RATE;
  const out = new Float32Array(Math.floor(total / ratio));
  for (let i = 0; i < out.length; i++) { // box-average downsample
    const a = Math.floor(i * ratio), b = Math.min(total, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = a; j < b; j++) sum += all[j];
    out[i] = sum / Math.max(1, b - a);
  }
  const size = CHUNK_SECONDS * TARGET_RATE, chunks: Blob[] = [];
  for (let i = 0; i < out.length; i += size) {
    const slice = out.subarray(i, i + size);
    if (slice.length >= TARGET_RATE * 0.3) chunks.push(encodeWav(slice));
  }
  return chunks;
}

function encodeWav(samples: Float32Array): Blob {
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const w = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_RATE, true); view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); w(36, "data"); view.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  return new Blob([view], { type: "audio/wav" });
}
