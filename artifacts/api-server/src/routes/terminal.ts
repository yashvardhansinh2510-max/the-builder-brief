import { Router, type IRouter, type Request, type Response } from "express";
import { OpenAI } from "openai";
import { KnowledgeBase } from "../services/knowledge";
import { verifyUser } from "../middleware/verifyUser";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const openai = new OpenAI();
const kb = new KnowledgeBase();

router.post("/terminal/command", verifyUser, async (req: Request, res: Response): Promise<void> => {
  const { command, context } = req.body;
  const email = req.user?.email;

  if (!command) {
    res.status(400).json({ error: "Command is required" });
    return;
  }

  try {
    // 1. Search Knowledge Base for proprietary context
    const searchResults = await kb.search(command);
    const knowledgeContext = searchResults;

    // 2. Execute Intelligence Engine
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are the Builder Brief Terminal (OperatorOS). 
          You provide tactical, aggressive, and highly technical founder advice. 
          Use YC logic and ruthless efficiency. No fluff. No generic advice.
          
          Context from our proprietary vault:
          ${knowledgeContext}
          
          Founder Startup Context:
          ${JSON.stringify(context || {})}
          
          Respond in a concise, terminal-style format. Use markdown for technical details.`
        },
        { role: "user", content: command }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;

    res.json({ 
      output: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error }, "Error executing terminal command");
    res.status(500).json({ error: "Terminal execution failed" });
  }
});

export default router;
