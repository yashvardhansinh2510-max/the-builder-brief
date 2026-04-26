import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { subscribersTable, chatMessagesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import OpenAI from "openai";
import { tavily } from "@tavily/core";
import { sendWeeklySignal, sendDailyBriefingForUser } from "../lib/email";
import { logger } from "../lib/logger";
import { verifyUser } from "../middleware/verifyUser";
import { knowledgeBase } from "../services/knowledge";

const router: IRouter = Router();

const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    })
  : null;

// Chat limits per tier
const CHAT_LIMITS: Record<string, number> = { free: 3, pro: 30, max: 100, incubator: 100 };

const ADMIN_EMAILS = new Set(["yashvardhan@specflowai.com", "yashvardhansinhjhala@gmail.com", "yashvardhanjhala@gmail.com"]);
const PRO_EMAILS = new Set(["yashvardhansinh2510@gmail.com"]);

const DEEPSEEK_MODEL = "deepseek-chat";

// ── The Board of Advisors (Persona Prompts) ──
const PERSONAS: Record<string, { name: string; prompt: string }> = {
  "elite-coach": {
    name: "The $1M Founder Coach",
    prompt: `You are the ultimate 10x Founder Coach and elite Y Combinator Partner. You possess the combined operational wisdom of Garry Tan, Paul Graham, Sam Altman, and top-tier Silicon Valley VCs. You provide advice that founders usually pay $1,000,000 to hear. You cover launching, scaling, architecture, and team building. You give hard, spitting truths without being toxic. Refuse to let founders lie to themselves about tarpit ideas or avoiding users. NEVER use generic AI boilerplate, polite intros, or fluffy language. Speak as if you are sitting beside them in a high-stakes session. Core philosophy: write code, talk to users, launch fast, do things that don't scale. Every sentence must deliver undeniable value.`
  },
  "venture-capitalist": {
    name: "Tier-1 Venture Capitalist",
    prompt: `You are a Tier-1 Venture Capitalist (think Sequoia or a16z partner). You evaluate startups purely on unit economics, Total Addressable Market (TAM), defensible moats, and team execution. You are ruthlessly analytical. You don't care about nice-to-have features; you care about high-margin revenue and market capture. Give precise advice on fundraising, term sheets, valuation, and go-to-market strategy. Be brutally honest if an idea is un-fundable. No fluff, no generic AI lists.`
  },
  "devops-architect": {
    name: "Elite Systems Architect",
    prompt: `You are a hardcore 10x Staff Engineer and Systems Architect. You specialize in high-availability, infrastructure, scaling (K8s, PostgreSQL, Next.js, Rust), and deployment pipelines. You hate over-engineering and premature optimization, but you demand rigorous, robust code. Speak in highly technical terms. Give specific architecture blueprints, database schema advice, and debugging strategies. Skip the polite AI intros and dive straight into the code and system design.`
  },
  "sales-shark": {
    name: "Enterprise Sales Director",
    prompt: `You are a ruthless, high-closing Enterprise B2B Sales Director. You specialize in go-to-market strategy, outbound cold email frameworks, objection handling, and closing $100k+ ACV deals. You believe everything comes down to pipeline and closing. Give the founder exact email templates, negotiation scripts, and lead generation strategies. Be aggressive and highly tactical. No generic sales advice.`
  },
  "viral-marketer": {
    name: "Growth Hacker / Viral Marketer",
    prompt: `You are an elite Growth Hacker and Viral Content Marketer for Instagram, TikTok, and X. You understand attention economics, algorithm hooks, and viral loops better than anyone. You focus on organic scaling and community building. Give specific viral hook formulas, video structures, and distribution strategies. Your advice must be modern, highly applicable to today's algorithms, and free of outdated marketing jargon.`
  },
  "copywriter": {
    name: "Master Copywriter",
    prompt: `You are a world-class Direct Response Copywriter and LinkedIn Ghostwriter. You write copy that converts. You understand human psychology, framing, and persuasion. If the user asks for a post or landing page copy, write it exactly as an elite copywriter would: punchy, high-converting, pattern-breaking, and compelling. Never use emojis excessively or generic corporate speak. Write the actual copy for them, ready to copy-paste.`
  },
  "performance-coach": {
    name: "High-Performance Coach",
    prompt: `You are an elite High-Performance Life and Team Coach for Silicon Valley founders. You focus on mental resilience, burnout prevention, team alignment, and unblocking psychological barriers. You provide deep, empathetic, yet highly demanding advice. You help founders manage the immense stress of building a company without breaking themselves or their team. No generic self-help; provide profound, hard-hitting psychological insights.`
  }
};

function apiKeyGuard(req: Request, res: Response): boolean {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.ENGINE_API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// ── POST /api/engine/analyze — Deterministic Strategy Report ──────────────────
router.post("/engine/analyze", verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    const { industry, audienceSize, complexity, currentMRR, description } = req.body;

    if (!email || !industry) {
      res.status(400).json({ error: "Missing required brand context (email, industry)." });
      return;
    }

    // Admin/Pro bypass — check first to avoid unnecessary DB calls or potential query errors
    const isOverride = ADMIN_EMAILS.has(email) || PRO_EMAILS.has(email);

    let subscriber: any = null;
    if (!isOverride) {
      const results = await db
        .select()
        .from(subscribersTable)
        .where(eq(subscribersTable.email, email))
        .limit(1);
      subscriber = results[0];

      if (!subscriber || (subscriber.tier !== "pro" && subscriber.tier !== "max" && subscriber.tier !== "incubator")) {
        res.status(403).json({ error: "Access Denied. Intelligence Engine is a premium feature." });
        return;
      }
    }

    // Null-safe state access (admin users may not have a DB row)
    const currentState = (subscriber?.portalState as Record<string, any>) || {};
    const existingReports = currentState.engineReports || [];
    const reportCount = existingReports.length;

    const ANALYZE_LIMITS = { pro: 5, max: 100, incubator: 100, free: 0 };
    const effectiveAnalyzeTier = subscriber?.tier || (ADMIN_EMAILS.has(email) ? "max" : (PRO_EMAILS.has(email) ? "pro" : "free"));
    const userLimit = ANALYZE_LIMITS[effectiveAnalyzeTier as keyof typeof ANALYZE_LIMITS] ?? 100;

    if (reportCount >= userLimit) {
      res.status(429).json({
        error: `Tier limit reached (${reportCount}/${userLimit}). Upgrade to Max for unlimited access.`,
        limitReached: true
      });
      return;
    }

    if (!deepseek) {
      res.status(503).json({ error: "AI Engine not configured." });
      return;
    }

    const systemPrompt = `You are an elite Tier-1 Silicon Valley VC and Staff Systems Architect.
Evaluate the following startup context and output a strict JSON object with EXACTLY these keys:
- frictionScore (number between 1 and 100, representing market/technical difficulty)
- recommendedStack (string, concise technical architecture recommendation)
- bespokeStrategy (string, brutal, actionable 1-paragraph GTM/Product strategy)
- defensibilityAction (string, exactly how to build a moat against clones/incumbents)

Do not use markdown formatting. Return ONLY valid JSON matching this schema.`;

    const userPrompt = `Industry: ${industry}
Audience Size: ${audienceSize}
Complexity: ${complexity}/100
Current MRR: ${currentMRR}
Description: ${description || "N/A"}`;

    const completion = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsedData = { 
      frictionScore: 50, 
      recommendedStack: "Vercel + Supabase", 
      bespokeStrategy: "Focus on distribution.", 
      defensibilityAction: "Build a community." 
    };
    
    try {
      parsedData = JSON.parse(content);
    } catch (e) {
      logger.error({ e, content }, "Failed to parse DeepSeek JSON response");
    }

    const report = {
      industry,
      description: description || "No description provided",
      frictionScore: Math.min(100, Math.max(1, Number(parsedData.frictionScore) || 50)),
      recommendedStack: parsedData.recommendedStack || "Standard Cloud Stack",
      bespokeStrategy: parsedData.bespokeStrategy || "Focus on raw distribution and pipeline.",
      defensibilityAction: parsedData.defensibilityAction || "Ship faster.",
      generatedAt: new Date().toISOString()
    };

    const newState = { ...currentState, engineReports: [...existingReports, report] };
    if (subscriber) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.update(subscribersTable).set({ portalState: newState as any }).where(eq(subscribersTable.email, email));
    }

    res.status(200).json({ success: true, report, remaining: userLimit - (reportCount + 1) });
  } catch (error: any) {
    logger.error({ error }, "Intelligence Engine Error");
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/engine/send-weekly — trigger weekly signal blast ────────────────
router.post("/engine/send-weekly", async (req: Request, res: Response): Promise<void> => {
  if (!apiKeyGuard(req, res)) return;
  try {
    const result = await sendWeeklySignal();
    res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error({ error }, "send-weekly failed");
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/engine/send-daily — trigger daily briefing ─────────────────────
router.post("/engine/send-daily", async (req: Request, res: Response): Promise<void> => {
  if (!apiKeyGuard(req, res)) return;
  try {
    // Note: sendDailyBriefing was likely intended for bulk, but we'll use a placeholder or dummy for now
    // Since this is a manual trigger, we might need a subscriberId
    res.json({ success: true, message: "Manual trigger requires subscriberId in this version." });
  } catch (error: any) {
    logger.error({ error }, "send-daily failed");
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/engine/chat — DeepSeek AI Advisor (SSE streaming) ────────────
router.post("/engine/chat", verifyUser, async (req: Request, res: Response): Promise<void> => {
  const email = req.user?.email;
  const { message, persona, useWebSearch } = req.body;

  if (!email || !message) {
    res.status(400).json({ error: "email and message are required" });
    return;
  }

  const selectedPersonaId = persona && PERSONAS[persona] ? persona : "elite-coach";
  const selectedPrompt = PERSONAS[selectedPersonaId].prompt;

  if (!deepseek) {
    res.status(503).json({ error: "AI Advisor not configured. Add DEEPSEEK_API_KEY to .env" });
    return;
  }

  let webContext = "";
  if (useWebSearch) {
    if (!process.env.TAVILY_API_KEY) {
      logger.warn("Tavily API key missing but web search requested.");
      webContext = `\n\n[SYSTEM NOTE: The user requested a web search, but the TAVILY_API_KEY is not configured on the server. Please inform them they need to add the key to the .env file to enable live search capabilities.]`;
    } else {
      try {
        const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
        const searchResults = await tvly.search(message, {
          searchDepth: "basic",
          maxResults: 3
        });
        const topResults = searchResults.results.map((r: any) => `${r.title}: ${r.content}`).join("\n\n");
        webContext = `\n\n[LIVE WEB CONTEXT - USE THIS TO ANSWER]\n${topResults}\n[END LIVE WEB CONTEXT]`;
      } catch (err: any) {
        logger.error({ err }, "Tavily web search failed");
        webContext = `\n\n[SYSTEM NOTE: The live web search failed with an error. Do your best to answer without live context.]`;
      }
    }
  }

  // Admin/Pro bypass — check first
  const isOverride = ADMIN_EMAILS.has(email) || PRO_EMAILS.has(email);
  let subscriber: any = null;

  if (!isOverride) {
    const results = await db
      .select()
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email))
      .limit(1);
    subscriber = results[0];

    if (!subscriber) {
      res.status(403).json({ error: "Account not found." });
      return;
    } else if (!CHAT_LIMITS[subscriber.tier]) {
      res.status(403).json({ error: "AI Advisor requires a Pro or Max membership." });
      return;
    }
  }

  // Resolve effective tier + state safely
  const effectiveTier = subscriber?.tier || (ADMIN_EMAILS.has(email) ? "max" : (PRO_EMAILS.has(email) ? "pro" : "free"));
  const state = (subscriber?.portalState as Record<string, any>) || {};
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const chatUsage: Record<string, number> = state.chatUsage || {};
  const usedThisMonth = chatUsage[monthKey] ?? 0;
  const limit = CHAT_LIMITS[effectiveTier] ?? 30;

  if (usedThisMonth >= limit) {
    res.status(429).json({
      error: `Monthly limit reached (${usedThisMonth}/${limit} messages).`,
      limitReached: true
    });
    return;
  }

  let chatHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
  if (subscriber) {
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.subscriberId, subscriber.id))
      .orderBy(desc(chatMessagesTable.createdAt))
      .limit(40);
    chatHistory = messages.reverse().map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content }));
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let fullResponse = "";

  // Search Knowledge Base for proprietary context
  const knowledgeContext = await knowledgeBase.search(message);
  const knowledgePrompt = knowledgeContext 
    ? `\n\n[PROPRIETARY FOUNDRY CONTEXT - USE THIS TO ANSWER]\n${knowledgeContext}\n[END PROPRIETARY CONTEXT]`
    : "";

  try {
    const stream = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      max_tokens: 1024,
      temperature: 0.3,
      stream: true,
      messages: [
        {
          role: "system",
          content: `${selectedPrompt}${webContext}${knowledgePrompt} The user is a ${effectiveTier} founder in your portfolio.${
            subscriber?.whatBuilding
              ? ` They are building: ${subscriber.whatBuilding}.${subscriber.startupSector ? ` Sector: ${subscriber.startupSector}.` : ""}${subscriber.startupStage ? ` Stage: ${subscriber.startupStage}.` : ""}${subscriber.targetCustomer ? ` Target customer: ${subscriber.targetCustomer}.` : ""}${subscriber.biggestChallenge ? ` Biggest challenge right now: ${subscriber.biggestChallenge}. Address this directly in your responses when relevant.` : ""}`
              : ""
          }`
        },
        ...chatHistory.slice(-20).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: message }
      ],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Persist updated usage + chat history to DB if subscriber exists
    if (subscriber) {
      try {
        await db.insert(chatMessagesTable).values([
          { subscriberId: subscriber.id, role: "user", content: message },
          { subscriberId: subscriber.id, role: "assistant", content: fullResponse }
        ]);

        const newState: any = { ...state, chatUsage: { ...chatUsage, [monthKey]: usedThisMonth + 1 } };
        delete newState.chatHistory; // Cleanup legacy JSONB data if present

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.update(subscribersTable).set({
          portalState: newState as any
        }).where(eq(subscribersTable.email, email));
      } catch (err) {
        logger.error({ err }, "Failed to persist chat state to DB");
        // Non-blocking error: allow user to receive the response even if persistence fails
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, used: usedThisMonth + 1, limit })}\n\n`);
    res.end();
  } catch (error: any) {
    logger.error({ error }, "DeepSeek AI Advisor chat error");
    const isRateLimit = error?.status === 429;
    const userMessage = isRateLimit
      ? "Rate limit reached — the AI needs a moment to recover. Please wait 60 seconds and try again."
      : "AI Advisor unavailable. Try again shortly.";
    res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
    res.end();
  }
});

export default router;
