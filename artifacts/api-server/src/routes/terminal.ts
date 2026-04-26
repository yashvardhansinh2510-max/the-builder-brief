import { Router, IRouter } from "express";
import { db, subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";
import OpenAI from "openai";
import { searchWeb } from "../lib/tavily"; // I'll assume I can use a helper or just openai

const router: IRouter = Router();
const openai = new OpenAI();

router.post("/terminal/command", verifyUser, async (req, res) => {
  try {
    const { command, args } = req.body;
    const email = (req as any).user?.email;
    const [subscriber] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email)).limit(1);

    if (!subscriber) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    let response = "";
    
    switch (command) {
      case "/market-scan":
        const target = args || subscriber.startupSector;
        const scanPrompt = `Perform a brutal, high-level market scan for: ${target}. Identify 3 major threats and 2 hidden opportunities for a founder at stage: ${subscriber.startupStage}.`;
        const scanRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: "You are an elite market intelligence bot." }, { role: "user", content: scanPrompt }],
        });
        response = scanRes.choices[0].message.content || "Scan failed.";
        break;

      case "/roast":
        const roastPrompt = `Roast this startup idea/status: "${subscriber.whatBuilding}". Be brutal, cynical, and highly tactical. Help this founder stop lying to themselves.`;
        const roastRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: "You are a cynical VC who hates bad ideas." }, { role: "user", content: roastPrompt }],
        });
        response = roastRes.choices[0].message.content || "Roast failed.";
        break;

      case "/sprint":
        const sprintPrompt = `Generate a 7-day high-intensity execution sprint for a ${subscriber.startupSector} founder building ${subscriber.whatBuilding}. Goal: Immediate traction.`;
        const sprintRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: "You are a high-performance execution coach." }, { role: "user", content: sprintPrompt }],
        });
        response = sprintRes.choices[0].message.content || "Sprint generation failed.";
        break;

      default:
        response = `Command not recognized: ${command}. Available: /market-scan, /roast, /sprint`;
    }

    return res.json({ output: response });
  } catch (error) {
    return res.status(500).json({ error: "Terminal command failed" });
  }
});

export default router;
