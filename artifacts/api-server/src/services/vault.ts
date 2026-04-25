import { db } from "@specflow/db";
import { articles, vaults } from "@specflow/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { curateWeeklyVault } from "../lib/openai";

export async function generateWeeklyVault(
  weekStartDate: string
): Promise<void> {
  // Check if vault already exists for this week
  const existing = await db
    .select()
    .from(vaults)
    .where(eq(vaults.vaultWeek, weekStartDate))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Vault already exists for ${weekStartDate}`);
    return;
  }

  // Get all articles from the past week
  const weekStart = new Date(weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekArticles = await db
    .select()
    .from(articles)
    .where(
      and(
        gte(articles.createdAt, weekStart),
        lt(articles.createdAt, weekEnd)
      )
    );

  if (weekArticles.length === 0) {
    console.log("No articles for this week");
    return;
  }

  const articleTexts = weekArticles.map(
    (a) => `${a.title}\n${a.content}`
  );

  // Generate vault with AI
  const vaultContent = await curateWeeklyVault(articleTexts, weekStartDate);

  // Store in DB
  await db.insert(vaults).values({
    vaultWeek: weekStartDate,
    title: vaultContent.title,
    description: vaultContent.description,
    content: vaultContent.content,
    sourceArticleIds: weekArticles.map((a) => a.id),
    isPublished: false,
  });

  console.log(`Vault generated for ${weekStartDate}`);
}
