import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { verifyUser } from "../middleware/verifyUser";
import { Resend } from "resend";

const router: IRouter = Router();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

router.post("/incubator/apply", verifyUser, async (req: Request, res: Response): Promise<void> => {
  const email = req.user?.email;
  const applicationData = req.body;

  if (!email || !applicationData) {
    res.status(400).json({ error: "Missing application data" });
    return;
  }

  try {
    const subscriber = await db
      .select()
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email))
      .limit(1);

    if (!subscriber.length) {
      res.status(404).json({ error: "Subscriber not found" });
      return;
    }

    // Save application state to portalState
    const currentPortalState = (subscriber[0].portalState || {}) as Record<string, any>;
    await db.update(subscribersTable)
      .set({
        portalState: {
          ...currentPortalState,
          incubatorApplication: {
            status: "pending",
            appliedAt: new Date().toISOString(),
            data: applicationData
          }
        },
        updatedAt: new Date()
      })
      .where(eq(subscribersTable.email, email));

    // Send notification to Admin (Yashvardhan)
    if (resend) {
      await resend.emails.send({
        from: "Incubator <system@thebuildbrief.com>",
        to: "yashvardhan@specflowai.com",
        subject: `New Incubator Application: ${email}`,
        text: `Founder ${email} has applied for the Incubator.\n\nData:\n${JSON.stringify(applicationData, null, 2)}`
      });
    }

    res.json({ success: true, message: "Application submitted successfully. Our partners will review your case within 48 hours." });
  } catch (error) {
    logger.error({ error }, "Error submitting incubator application");
    res.status(500).json({ error: "Failed to submit application" });
  }
});

export default router;
