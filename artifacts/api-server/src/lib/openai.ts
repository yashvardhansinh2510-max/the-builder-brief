import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeForBrief(
  articleTexts: string[],
  userPersonalization: {
    interests?: string[];
    focusAreas?: string[];
    contextStyle?: string;
  }
): Promise<string> {
  const focusContext = userPersonalization.focusAreas?.length
    ? `Focus on these areas: ${userPersonalization.focusAreas.join(", ")}.`
    : "";

  const styleGuide =
    userPersonalization.contextStyle === "quick"
      ? "Keep it ultra-brief (max 3 sentences)."
      : "Provide detailed analysis.";

  const prompt = `You are a founder intelligence briefer. Synthesize these articles into a daily brief for a founder.

${focusContext}
${styleGuide}

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Return ONLY the summary (no preamble).`;

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const summary =
    response.choices[0].message.content || "";
  return summary;
}

export async function curateDailyHighlights(
  articleTexts: string[],
  count: number = 5
): Promise<string[]> {
  const prompt = `You are a founder newsletter editor. Extract the top ${count} actionable insights from these articles as bullet points.

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Return ONLY the bullet points, one per line, no numbering.`;

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0].message.content || "";
  return text.split("\n").filter((line) => line.trim());
}

export async function curateWeeklyVault(
  articleTexts: string[],
  weekStart: string
): Promise<{ title: string; description: string; content: string }> {
  const prompt = `You are a founder intelligence curator. Create a weekly vault (curated digest) from these articles.

Week starting: ${weekStart}

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Respond in JSON format:
{
  "title": "Week of X: [catchy title capturing the theme]",
  "description": "[One sentence about this week's themes]",
  "content": "[2-3 paragraphs synthesizing key takeaways]"
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0].message.content || "";
  return JSON.parse(text);
}
