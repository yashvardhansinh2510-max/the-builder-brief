import { Request, Response, NextFunction } from "express";
import { db, subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = (req as any).user?.email;
    if (!email) {
      res.status(401).json({ error: "Unauthorized: No email in session" });
      return;
    }

    const [subscriber] = await db
      .select({ isAdmin: subscribersTable.isAdmin })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email))
      .limit(1);

    if (!subscriber || !subscriber.isAdmin) {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error during admin verification" });
  }
};
