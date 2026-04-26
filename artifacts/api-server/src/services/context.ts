import { db, articlesTable, personalizationTable, subscribersTable } from "@workspace/db";
import { eq, gte, and } from "drizzle-orm";
import { summarizeForBrief, curateDailyHighlights } from "../lib/openai";

export async function buildDailyContextForUser(
  subscriberId: number
): Promise<{
  summary: string;
  highlights: string[];
  articleCount: number;
}> {
  // Get user personalization preferences
  const userPref = await db
    .select()
    .from(personalizationTable)
    .where(eq(personalizationTable.subscriberId, subscriberId))
    .limit(1);

  const prefs = userPref[0] || {};

  // Get today's articles
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayArticles = await db
    .select()
    .from(articlesTable)
    .where(
      gte(articlesTable.createdAt, today)
    );

  // Filter by user interests if specified
  let filteredArticles = todayArticles;
  if (prefs.interests && prefs.interests.length > 0) {
    filteredArticles = todayArticles.filter(
      (article) => article.category && prefs.interests!.includes(article.category)
    );
  }

  if (filteredArticles.length === 0) {
    return {
      summary: "No articles today.",
      highlights: [],
      articleCount: 0,
    };
  }

  const articleTexts = filteredArticles.map(
    (a) => `${a.title}\n${a.content}`
  );

  const summary = await summarizeForBrief(articleTexts, {
    interests: prefs.interests ?? undefined,
    focusAreas: prefs.focusAreas ?? undefined,
    contextStyle: prefs.contextStyle,
  });

  const highlights = await curateDailyHighlights(articleTexts);

  return {
    summary,
    highlights,
    articleCount: filteredArticles.length,
  };
}
