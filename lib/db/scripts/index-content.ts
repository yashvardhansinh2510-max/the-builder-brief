import { db, dailyDropsTable, playbookLessonsTable } from "../src/index.ts";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI();

async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.replace(/\n/g, " "),
  });
  return response.data[0].embedding;
}

async function indexDailyDrops() {
  const drops = await db.select().from(dailyDropsTable);
  console.log(`Found ${drops.length} daily drops to index...`);
  for (const drop of drops) {
    console.log(`Indexing drop: ${drop.title}`);
    const embedding = await generateEmbedding(`${drop.title} ${drop.category} ${drop.value} ${drop.content}`);
    // Manual SQL for vector insertion if text() doesn't work well
    await db.update(dailyDropsTable)
      .set({ embedding: JSON.stringify(embedding) })
      .where(eq(dailyDropsTable.id, drop.id));
  }
}

async function indexLessons() {
  const lessons = await db.select().from(playbookLessonsTable);
  console.log(`Found ${lessons.length} lessons to index...`);
  for (const lesson of lessons) {
    console.log(`Indexing lesson: ${lesson.title}`);
    const embedding = await generateEmbedding(`${lesson.title} ${lesson.content}`);
    await db.update(playbookLessonsTable)
      .set({ embedding: JSON.stringify(embedding) })
      .where(eq(playbookLessonsTable.id, lesson.id));
  }
}

async function main() {
  await indexDailyDrops();
  await indexLessons();
  console.log("Indexing complete.");
}

main().catch(console.error);
