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
  if (!articleTexts || articleTexts.length === 0) {
    return "No articles to summarize.";
  }

  const focusContext = userPersonalization.focusAreas?.length
    ? `Focus on these areas: ${userPersonalization.focusAreas.join(", ")}.`
    : "";

  const styleGuide =
    userPersonalization.contextStyle === "quick"
      ? "Keep it ultra-brief (max 3 sentences)."
      : "Provide detailed analysis.";

  const prompt = `You are a founder intelligence briefer writing for operators who've been through acquisitions.
No marketing hype. Cut through BS. Signal over noise.

Synthesize these articles into a daily brief for a founder.

${focusContext}
${styleGuide}

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Return ONLY the summary (no preamble).`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4-mini",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response");
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI error:", error);
    return "Unable to generate brief. Try again later.";
  }
}

export async function curateDailyHighlights(
  articleTexts: string[],
  count: number = 5
): Promise<string[]> {
  if (!articleTexts || articleTexts.length === 0) {
    return [];
  }

  const prompt = `You are a founder newsletter editor. No marketing jargon or hype. Write like a serial founder. Assume reader has exited startups before.
Extract the top ${count} actionable insights from these articles as bullet points.

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Return ONLY the bullet points, one per line, no numbering.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4-mini",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response");
    }

    const text = response.choices[0].message.content;
    return text.split("\n").filter((line) => line.trim());
  } catch (error) {
    console.error("OpenAI error:", error);
    return [];
  }
}

export async function curateWeeklyVault(
  articleTexts: string[],
  weekStart: string
): Promise<{ title: string; description: string; content: string }> {
  if (!articleTexts || articleTexts.length === 0) {
    return {
      title: "Week of " + weekStart,
      description: "No articles available for this week.",
      content: "Unable to generate weekly vault. Try again with more articles.",
    };
  }

  const prompt = `You are a founder intelligence curator. No fluff, no marketing speak. Signal over noise. Write for founders who've been through liquidity events.
Create a weekly vault (curated digest) from these articles.

Week starting: ${weekStart}

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Respond in JSON format:
{
  "title": "Week of X: [catchy title capturing the theme]",
  "description": "[One sentence about this week's themes]",
  "content": "[2-3 paragraphs synthesizing key takeaways]"
}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4-mini",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response");
    }

    const text = response.choices[0].message.content;
    return JSON.parse(text);
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      title: "Week of " + weekStart,
      description: "Unable to generate summary.",
      content: "Failed to create weekly vault. Try again later.",
    };
  }
}
