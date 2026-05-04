import { Router } from "express";
import { Anthropic } from "@anthropic-ai/sdk";
import { verifyUser } from "../middleware/verifyUser";

const router = Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post("/analyze", verifyUser, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemPrompt = `You are an expert startup analyst. Analyze the given business idea and provide structured insights.

Return your analysis in this exact format:
MARKET_ANALYSIS:
[Provide TAM, market size, growth rate, key pain points, addressable segment in bullet points]

COMPETITORS:
[List 3-5 direct and indirect competitors with brief descriptions]

GTM_STRATEGY:
[Provide 4-5 key GTM steps including target market, channels, pricing approach, and activation strategy]`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Analyze this startup idea: ${prompt}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const sections = responseText.split(/\n(?=MARKET_ANALYSIS:|COMPETITORS:|GTM_STRATEGY:)/);
    const extractSection = (name: string) => {
      const section = sections.find((s) => s.startsWith(name));
      return section
        ? section.replace(new RegExp(`^${name}:\\n?`), "").trim()
        : "";
    };

    const analysis = {
      analysis: extractSection("MARKET_ANALYSIS"),
      competitors: extractSection("COMPETITORS")
        .split("\n")
        .filter((c) => c.trim()),
      gtm: extractSection("GTM_STRATEGY"),
    };

    return res.json(analysis);
  } catch (error) {
    console.error("Error in idea-agent:", error);
    return res.status(500).json({ error: "Failed to analyze idea" });
  }
});

export default router;
