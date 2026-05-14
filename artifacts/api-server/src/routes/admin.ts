import { Router, IRouter } from "express";
import { z } from "zod";
import { db, dailyDropsTable, playbookModulesTable, playbookLessonsTable, subscribersTable, productsTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";
import { verifyAdmin } from "../middleware/verifyAdmin";

const dailyDropSchema = z.object({
  pillar: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  categoryIcon: z.string().optional(),
  value: z.string().optional(),
  content: z.string().min(1),
  actionLabel: z.string().optional(),
  dayOfWeek: z.number().int().min(1).max(7),
});

const playbookModuleSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0),
});

const productSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().default(""),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  category: z.string().default("template"),
  contentUrl: z.string().url().optional().or(z.literal("")).optional(),
});

const router: IRouter = Router();

// Apply both middlewares to all routes in this file
router.use(verifyUser);
router.use(verifyAdmin);

// DAILY DROPS MANAGEMENT
router.get("/admin/daily-drops", async (req, res) => {
  const drops = await db.select().from(dailyDropsTable).orderBy(asc(dailyDropsTable.dayOfWeek));
  res.json(drops);
});

router.post("/admin/daily-drops", async (req, res) => {
  const result = dailyDropSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });
  const { pillar, title, category, categoryIcon, value, content, actionLabel, dayOfWeek } = result.data;
  const [inserted] = await db.insert(dailyDropsTable).values({
    pillar, title, category, categoryIcon, value, content, actionLabel, dayOfWeek
  }).onConflictDoUpdate({
    target: [dailyDropsTable.dayOfWeek],
    set: { pillar, title, category, categoryIcon, value, content, actionLabel }
  }).returning();
  return res.json(inserted);
});

// PLAYBOOK MANAGEMENT
router.get("/admin/playbook/modules", async (req, res) => {
  const modules = await db.select().from(playbookModulesTable).orderBy(asc(playbookModulesTable.order));
  res.json(modules);
});

router.post("/admin/playbook/modules", async (req, res) => {
  const result = playbookModuleSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });
  const { slug, title, description, order } = result.data;
  const [inserted] = await db.insert(playbookModulesTable).values({
    slug, title, description, order
  }).onConflictDoUpdate({
    target: [playbookModulesTable.slug],
    set: { title, description, order }
  }).returning();
  return res.json(inserted);
});

// SUBSCRIBER MANAGEMENT
router.get("/admin/subscribers", async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 200);
  const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);
  const subs = await db.select().from(subscribersTable).orderBy(desc(subscribersTable.createdAt)).limit(limit).offset(offset);
  res.json({ data: subs, limit, offset });
});

// PRODUCT MANAGEMENT
router.get("/admin/products", async (req, res) => {
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  res.json(products);
});

router.post("/admin/products", async (req, res) => {
  const result = productSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });
  const { slug, name, description, price, category, contentUrl } = result.data;
  const [inserted] = await db.insert(productsTable).values({
    slug, name, description, price, category, contentUrl: contentUrl || null
  }).onConflictDoUpdate({
    target: [productsTable.slug],
    set: { name, description, price, category, contentUrl: contentUrl || null }
  }).returning();
  return res.json(inserted);
});

export default router;
