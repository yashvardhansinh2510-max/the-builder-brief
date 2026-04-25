import Parser from "rss-parser";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db/schema";
import { logger } from "../lib/logger";

const parser = new Parser();

export async function ingestFromRss(url: string) {
  logger.info({ url }, "Starting RSS ingestion");
  try {
    const feed = await parser.parseURL(url);
    logger.info({ title: feed.title, itemCount: feed.items.length }, "Feed parsed successfully");

    const newArticles = [];
    for (const item of feed.items) {
      if (!item.title || !item.content) continue;

      // Basic deduplication could be added here (e.g. check for existing title/source)
      
      newArticles.push({
        title: item.title,
        content: item.contentSnippet || item.content || "",
        source: url,
        category: "external",
      });
    }

    if (newArticles.length > 0) {
      await db.insert(articlesTable).values(newArticles);
      logger.info({ count: newArticles.length }, "Articles ingested from RSS");
    }

    return { count: newArticles.length };
  } catch (error) {
    logger.error({ error, url }, "RSS ingestion failed");
    throw error;
  }
}

export async function uploadArticle(data: { title: string; content: string; source: string; category?: string }) {
  try {
    const [inserted] = await db.insert(articlesTable).values({
      title: data.title,
      content: data.content,
      source: data.source,
      category: data.category || "submission",
    }).returning();
    
    logger.info({ articleId: inserted.id }, "Article uploaded manually");
    return inserted;
  } catch (error) {
    logger.error({ error }, "Manual article upload failed");
    throw error;
  }
}
