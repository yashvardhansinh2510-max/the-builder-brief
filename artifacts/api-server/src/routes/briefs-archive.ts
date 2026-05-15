import { Router } from "express";

const router = Router();

// Frontend uses lib/data.ts directly. This endpoint exists as a foundation for future DB-backed briefs.
router.get("/", (_req, res) => {
  res.json({ briefs: [], total: 0, page: 1, hasMore: false });
});

export default router;
