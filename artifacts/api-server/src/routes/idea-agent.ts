import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";

const router = Router();

router.post("/analyze", verifyUser, async (_req, res) => {
  res.status(501).json({ error: "Idea analysis not available" });
});

export default router;
