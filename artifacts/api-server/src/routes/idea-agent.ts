import { Router } from "express";
import OpenAI from "openai";
import { verifyUser } from "../middleware/verifyUser";
import { db, subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const USAGE_LIMITS: Record<string, number> = {
  free: 2,
  pro: 20,
  max: Infinity,
};

const SYSTEM_PROMPT = `You are a brutally honest startup advisor. Analyze the given idea and produce a structured report with exactly these 7 sections in order, each starting with ## followed by the section name on its own line:

## SCORECARD
Rate each dimension 0-100:
Opportunity: [number]
Problem: [number]
Feasibility: [number]
Why Now: [number]

## MARKET SIZE
Estimate TAM with reasoning.

## COMPETITOR GAPS
Bullet list of what existing players are missing.

## WHY NOW
3 bullets on timing.

## FIRST 10 CUSTOMERS
Specific, unglamorous acquisition strategy.

## FIRST REVENUE PATH
Pricing model and timeline to first dollar.

## RISK FLAGS
2-3 specific risks the founder must know.

Be direct. No fluff. Real numbers where possible.`;

router.post("/analyze", verifyUser, async (req, res): Promise<void> => {
  const email = req.user?.email;
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { idea, stage, targetMarket, budget } = req.body as {
    idea?: string;
    stage?: string;
    targetMarket?: string;
    budget?: string;
  };

  if (!idea || idea.trim().length < 10) {
    res.status(400).json({ error: "idea is required (min 10 chars)" });
    return;
  }

  // Load subscriber + check usage
  const [subscriber] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email))
    .limit(1);

  if (!subscriber) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  const tier = subscriber.tier ?? "free";
  const limit = USAGE_LIMITS[tier] ?? 2;
  const portalState = (subscriber.portalState as Record<string, unknown>) ?? {};
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  let usageCount = 0;
  if (portalState.ideaAgentUsageMonth === currentMonth) {
    usageCount = (portalState.ideaAgentUsageCount as number) ?? 0;
  }

  if (usageCount >= limit) {
    res.status(429).json({
      error: "Usage limit reached",
      limit,
      used: usageCount,
      resetMonth: currentMonth,
    });
    return;
  }

  // Increment usage before streaming
  await db
    .update(subscribersTable)
    .set({
      portalState: {
        ...portalState,
        ideaAgentUsageCount: usageCount + 1,
        ideaAgentUsageMonth: currentMonth,
      },
    })
    .where(eq(subscribersTable.email, email));

  // Build user message
  const contextParts = [
    `Idea: ${idea.trim()}`,
    stage && `Stage: ${stage}`,
    targetMarket && `Target market: ${targetMarket}`,
    budget && `Budget range: ${budget}`,
  ].filter(Boolean);
  const userMessage = contextParts.join("\n");

  // Stream SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1500,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "Stream error", type: "error" })}\n\n`);
  } finally {
    res.end();
  }
});

router.post("/save", verifyUser, async (req, res): Promise<void> => {
  res.status(501).json({ error: "Save to vault not yet implemented" });
});

router.post("/share", verifyUser, async (req, res): Promise<void> => {
  res.status(501).json({ error: "Share analysis not yet implemented" });
});

export default router;
