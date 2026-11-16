export const maxDuration = 30;

export async function POST(req: Request) {
  const { text, voice } = await req.json();
  if (!text || typeof text !== "string") return Response.json({ error: "No text" }, { status: 400 });
  const res = await fetch("https://api.vachana.ai/api/v1/tts/inference", {
    method: "POST",
    headers: { "X-API-Key-ID": process.env.GNANI_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text.slice(0, 600), voice: ["Nalini", "Deepak"].includes(voice) ? voice : "Nalini", model: "timbre-v2.5", language: "en-IN", speed: 1.0,
      audio_config: { sample_rate: 24000, num_channels: 1, sample_width: 2, encoding: "linear_pcm", container: "wav" },
    }),
  });
  if (!res.ok) return Response.json({ error: `TTS ${res.status}` }, { status: 502 });
  return new Response(res.body, { headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
}
