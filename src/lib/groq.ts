// Groq chat with model fallback. JSON mode; checks finish_reason so truncated JSON is never trusted.
const MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"];

export type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function groqJSON<T>(messages: Msg[], maxTokens = 1500): Promise<T> {
  let lastErr = "";
  for (const model of MODELS) {
    let res: Response;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, response_format: { type: "json_object" }, max_tokens: maxTokens, temperature: 0.6 }),
        signal: AbortSignal.timeout(12000), // a stuck request must not freeze a live interview: fall through to the next model
      });
    } catch { lastErr = `${model}: timeout/network`; continue; }
    const data = await res.json().catch(() => null);
    const choice = data?.choices?.[0];
    if (!res.ok || !choice) { lastErr = `${model}: ${data?.error?.message ?? res.status}`; continue; }
    if (choice.finish_reason === "length") { lastErr = `${model}: truncated`; continue; }
    try { return JSON.parse(choice.message.content) as T; } catch { lastErr = `${model}: bad JSON`; }
  }
  throw new Error(`LLM failed (${lastErr})`);
}
