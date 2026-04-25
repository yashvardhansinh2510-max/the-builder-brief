import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { leadsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const CreateLeadBody = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  twitter_handle: z.string().optional(),

  startup_name: z.string().optional(),
  stage: z.enum(["idea", "mvp", "revenue", "scaling"]).default("idea"),
  industry: z.string().optional(),
  problem: z.string().optional(),
  traction: z.string().optional(),

  goals: z.string().min(1, "Goals are required"),
  looking_for: z.string().optional(),
  revenue_goal: z.string().optional(),
  why_now: z.string().optional(),
  referral_source: z.string().optional(),
  deck_url: z.string().url().optional().or(z.literal("")),
});

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    return;
  }

  const data = parsed.data;

  try {
    const [lead] = await db
      .insert(leadsTable)
      .values({
        name: data.name,
        email: data.email,
        linkedin_url: data.linkedin_url || null,
        twitter_handle: data.twitter_handle || null,
        startup_name: data.startup_name || null,
        stage: data.stage,
        industry: data.industry || null,
        problem: data.problem || null,
        traction: data.traction || null,
        goals: data.goals,
        looking_for: data.looking_for || null,
        revenue_goal: data.revenue_goal || null,
        why_now: data.why_now || null,
        referral_source: data.referral_source || null,
        deck_url: data.deck_url || null,
      })
      .returning();

    res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error("Failed to insert lead:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leads/:uuid", async (req, res): Promise<void> => {
  const { uuid } = req.params;

  try {
    const [lead] = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.uuid, uuid))
      .limit(1);

    if (!lead) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.status(200).json({ success: true, lead });
  } catch (err) {
    console.error("Failed to fetch lead:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
