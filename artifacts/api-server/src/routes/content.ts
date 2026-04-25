import { Router, IRouter } from "express";
import { db, dailyDropsTable, playbookModulesTable, playbookLessonsTable, subscribersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";
import OpenAI from "openai";

const router: IRouter = Router();
const openai = new OpenAI();

// GET /api/content/daily — Fetch today's drop
router.get("/content/daily", async (req, res) => {
  try {
    const dayOfWeek = new Date().getDay();
    const [drop] = await db.select()
      .from(dailyDropsTable)
      .where(eq(dailyDropsTable.dayOfWeek, dayOfWeek))
      .limit(1);

    if (!drop) {
      res.status(404).json({ error: "No drop found for today" });
      return;
    }

    res.json(drop);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch daily drop" });
  }
});

// POST /api/content/daily/personalize — Generate AI application brief
router.post("/content/daily/personalize", verifyUser, async (req, res) => {
  try {
    const email = (req as any).user?.email;
    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);
    
    if (!subscriber) return res.status(404).json({ error: "Subscriber not found" });

    const dayOfWeek = new Date().getDay();
    const [drop] = await db.select().from(dailyDropsTable).where(eq(dailyDropsTable.dayOfWeek, dayOfWeek)).limit(1);
    
    if (!drop) return res.status(404).json({ error: "No drop today" });

    const prompt = `
      As an elite startup advisor for "The Builder Brief", generate a short, high-impact "Personalized Application" for a founder.
      
      DAILY DROP: ${drop.title} - ${drop.value}
      CONTENT: ${drop.content}
      
      FOUNDER CONTEXT:
      - Building: ${subscriber.whatBuilding || "Stealth Startup"}
      - Stage: ${subscriber.startupStage || "Idea/Pre-seed"}
      - Sector: ${subscriber.startupSector || "SaaS"}
      - Challenge: ${subscriber.biggestChallenge || "General Growth"}
      
      TASK: Write 2-3 sentences max explaining exactly how this founder should apply today's drop to their specific startup. Be direct, aggressive, and highly tactical. No fluff.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "You are an elite, concise startup advisor." }, { role: "user", content: prompt }],
      max_tokens: 150,
    });

    res.json({ personalizedBrief: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to personalize content" });
  }
});

// GET /api/content/playbook — Fetch all modules and lessons
router.get("/content/playbook", async (req, res) => {
  try {
    const modules = await db.select()
      .from(playbookModulesTable)
      .orderBy(asc(playbookModulesTable.order));

    const lessons = await db.select()
      .from(playbookLessonsTable)
      .orderBy(asc(playbookLessonsTable.order));

    const result = modules.map(mod => ({
      ...mod,
      lessons: lessons.filter(l => l.moduleId === mod.id)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playbook" });
  }
});

export default router;
