import { Router, IRouter } from "express";
import { db, dailyDropsTable, playbookModulesTable, playbookLessonsTable, subscribersTable, productsTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";
import { verifyAdmin } from "../middleware/verifyAdmin";

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
  const { pillar, title, category, categoryIcon, value, content, actionLabel, dayOfWeek } = req.body;
  const [inserted] = await db.insert(dailyDropsTable).values({
    pillar, title, category, categoryIcon, value, content, actionLabel, dayOfWeek
  }).onConflictDoUpdate({
    target: [dailyDropsTable.dayOfWeek],
    set: { pillar, title, category, categoryIcon, value, content, actionLabel }
  }).returning();
  res.json(inserted);
});

// PLAYBOOK MANAGEMENT
router.get("/admin/playbook/modules", async (req, res) => {
  const modules = await db.select().from(playbookModulesTable).orderBy(asc(playbookModulesTable.order));
  res.json(modules);
});

router.post("/admin/playbook/modules", async (req, res) => {
  const { slug, title, description, order } = req.body;
  const [inserted] = await db.insert(playbookModulesTable).values({
    slug, title, description, order
  }).onConflictDoUpdate({
    target: [playbookModulesTable.slug],
    set: { title, description, order }
  }).returning();
  res.json(inserted);
});

// SUBSCRIBER MANAGEMENT
router.get("/admin/subscribers", async (req, res) => {
  const subs = await db.select().from(subscribersTable).orderBy(desc(subscribersTable.createdAt)).limit(100);
  res.json(subs);
});

// PRODUCT MANAGEMENT
router.get("/admin/products", async (req, res) => {
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  res.json(products);
});

router.post("/admin/products", async (req, res) => {
  const { slug, name, description, price, category, contentUrl } = req.body;
  const [inserted] = await db.insert(productsTable).values({
    slug, name, description, price, category, contentUrl
  }).onConflictDoUpdate({
    target: [productsTable.slug],
    set: { name, description, price, category, contentUrl }
  }).returning();
  res.json(inserted);
});

export default router;
