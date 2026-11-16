export const maxDuration = 30;

// Receives a ≤30s WAV (browser records WAV because Gnani rejects webm) and forwards to Prisma.
export async function POST(req: Request) {
  const fd = await req.formData();
  const file = fd.get("audio_file");
  const keyterms = fd.get("keyterms");
  if (!(file instanceof File)) return Response.json({ error: "No audio" }, { status: 400 });
  const form = new FormData();
  form.append("audio_file", file, "answer.wav");
  form.append("model", "prisma-v3.0");
  form.append("language_code", "en-IN"); // en-IN accepts Hindi-English mixed audio, outputs Latin script
  if (typeof keyterms === "string" && keyterms) form.append("keyterms", keyterms); // hints so project names are spelled right
  const res = await fetch("https://api.vachana.ai/stt/v3", { method: "POST", headers: { "X-API-Key-ID": process.env.GNANI_API_KEY! }, body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) return Response.json({ error: data?.error?.message ?? `STT ${res.status}` }, { status: 502 });
  return Response.json({ transcript: data.transcript as string });
}
