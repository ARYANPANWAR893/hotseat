import { extractText, getDocumentProxy } from "unpdf";

export async function POST(req: Request) {
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > 4_000_000) return Response.json({ error: "PDF too large (max 4 MB)" }, { status: 413 });
  try {
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    if (text.trim().length < 50) return Response.json({ error: "Couldn't read text from this PDF (scanned?). Paste it instead." }, { status: 422 });
    return Response.json({ text: text.trim() });
  } catch {
    return Response.json({ error: "Couldn't read this PDF. Paste the text instead." }, { status: 422 });
  }
}
