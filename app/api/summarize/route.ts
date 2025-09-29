import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { text }: { text: string } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Summarize the following text in two ways. 
      Return only the summaries without any labels:
      1. A one-sentence headline (max 15 words).
      2. A short summary (2 sentences, max 50 words).

      Text: ${text}`;

    const result = await model.generateContent(prompt);

    // Extract response text
    const raw =
      typeof result?.response?.text === "function"
        ? result.response.text()
        : result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!raw) {
      throw new Error("No summary returned from model.");
    }

    // Split summaries into two parts
    const [headline, shortSummary] = raw.split("\n").filter(Boolean);

    return new Response(
      JSON.stringify({
        headline: headline.trim(),
        shortSummary: shortSummary?.trim() || "",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = typeof error === "string" ? error : error || "Unknown error";
    console.error("❌ API error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
