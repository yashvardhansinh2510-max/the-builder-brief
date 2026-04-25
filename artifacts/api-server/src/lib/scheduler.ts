import cron from "node-cron";
import { db } from "@specflow/db";
import { subscribers, dailyBriefs } from "@specflow/db/schema";
import { buildDailyContextForUser } from "../services/context";
import { generateWeeklyVault } from "../services/vault";

export function initSchedulers() {
  // Daily brief generation: 6 AM UTC every day
  cron.schedule("0 6 * * *", async () => {
    console.log("[Scheduler] Generating daily briefs...");

    try {
      // Get all Pro and Max users
      const proMaxUsers = await db
        .select()
        .from(subscribers)
        .where((s) => s.tier.inArray(["Pro", "Max"]));

      for (const user of proMaxUsers) {
        try {
          const context = await buildDailyContextForUser(user.id);
          const today = new Date().toISOString().split("T")[0];

          await db.insert(dailyBriefs).values({
            subscriberId: user.id,
            briefDate: today,
            summary: context.summary,
            highlights: context.highlights,
            sourceArticleIds: [],
          });

          console.log(`✓ Generated brief for user ${user.id}`);
        } catch (error) {
          console.error(`✗ Failed to generate brief for user ${user.id}`, error);
        }
      }

      console.log("[Scheduler] Daily briefs complete");
    } catch (error) {
      console.error("[Scheduler] Failed to fetch users", error);
    }
  });

  // Weekly vault generation: Every Friday at 8 AM UTC
  cron.schedule("0 8 * * 5", async () => {
    console.log("[Scheduler] Generating weekly vault...");

    try {
      // Get the start of last week (calculate last Friday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysBack = (dayOfWeek - 5 + 7) % 7; // Go back to last Friday
      const lastFriday = new Date(today);
      lastFriday.setDate(today.getDate() - daysBack);
      const weekStartDate = lastFriday.toISOString().split("T")[0];

      await generateWeeklyVault(weekStartDate);
      console.log("[Scheduler] Weekly vault complete");
    } catch (error) {
      console.error("[Scheduler] Failed to generate vault", error);
    }
  });

  console.log("Schedulers initialized");
}
