import { Router, IRouter } from "express";
import { db, subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";
import OpenAI from "openai";

const router: IRouter = Router();
const openai = new OpenAI();

// POST /api/scorecard/generate — Generate AI startup scorecard
router.post("/scorecard/generate", verifyUser, async (req, res) => {
  try {
    const email = (req as any).user?.email;
    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const prompt = `
      As an elite Venture Capitalist and Startup Strategist, analyze this founder's profile and generate a "Foundry Scorecard".
      
      FOUNDER CONTEXT:
      - Building: ${subscriber.whatBuilding || "Unknown"}
      - Stage: ${subscriber.startupStage || "Idea"}
      - Sector: ${subscriber.startupSector || "General SaaS"}
      - Challenge: ${subscriber.biggestChallenge || "Market Penetration"}
      
      OUTPUT FORMAT (JSON ONLY):
      {
        "score": number (0-100),
        "breakdown": {
          "product": number (0-100),
          "market": number (0-100),
          "execution": number (0-100)
        },
        "verdict": "string (brutal but fair 1-sentence summary)",
        "roadmap": [
          { "day": 1, "task": "string", "goal": "string" },
          ... up to 7 days
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "You are an elite VC partner." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const scorecard = JSON.parse(response.choices[0].message.content || "{}");

    await db.update(subscribersTable)
      .set({ 
        foundryScore: scorecard.score,
        roadmap: scorecard
      })
      .where(eq(subscribersTable.id, subscriber.id));

    res.json(scorecard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate scorecard" });
  }
});

// GET /api/scorecard/me — Fetch current scorecard
router.get("/scorecard/me", verifyUser, async (req, res) => {
  const email = (req as any).user?.email;
  const [subscriber] = await db.select({ roadmap: subscribersTable.roadmap }).from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
  res.json(subscriber?.roadmap || null);
});

export default router;
