import { Router } from "express";
import { ingestFromRss, uploadArticle } from "../services/ingestion";
import { logger } from "../lib/logger";

const router = Router();

// POST /api/articles/upload - Manual upload
router.post("/upload", async (req, res) => {
  try {
    const { title, content, source, category } = req.body;
    if (!title || !content || !source) {
      return res.status(400).json({ error: "Missing required fields: title, content, source" });
    }

    const article = await uploadArticle({ title, content, source, category });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: "Failed to upload article" });
  }
});

// POST /api/articles/ingest-rss - Trigger RSS ingestion
router.post("/ingest-rss", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Missing RSS URL" });
    }

    const result = await ingestFromRss(url);
    res.json({ message: "Ingestion complete", ...result });
  } catch (error) {
    res.status(500).json({ error: "RSS ingestion failed" });
  }
});

export default router;
