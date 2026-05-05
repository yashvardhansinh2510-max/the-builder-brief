import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { issues } from "../lib/issues-data";
import { z } from "zod";
import { unauthorizedError, badRequestError, notFoundError, serverError, forbiddenError, successResponse } from "../utils";

const router = Router();

// Traction validation schema
const tractioinSchema = z.object({
  status: z.enum(["added", "pending", "archived"]),
  mrr: z.number().min(0).optional(),
  arr: z.number().min(0).optional(),
  users: z.number().int().min(1).optional(),
  monthsSinceLaunch: z.number().int().min(1),
  growthRate: z.number().min(0).max(100).optional(),
  addedAt: z.string().datetime(),
  lastUpdated: z.string().datetime(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.mrr !== undefined || data.arr !== undefined || data.users !== undefined,
  { message: "At least one metric (MRR, ARR, or users) must be provided" }
);

// POST /api/blueprints/:slug/traction - Create or update traction data
router.post("/:slug/traction", verifyUser, (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return unauthorizedError(res);
    }

    // Find blueprint by slug
    const issue = issues.find((i: any) => i.slug === slug);
    if (!issue) {
      return notFoundError(res, "Blueprint not found");
    }

    // Verify creator ownership
    if ((issue as any).creatorId !== userId) {
      return forbiddenError(res, "Only the blueprint creator can update traction");
    }

    // Validate request payload against schema
    const validatedData = tractioinSchema.parse({
      status: "added",
      ...req.body,
      addedAt: (issue as any).traction?.addedAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    // Update traction data in-memory
    (issue as any).traction = validatedData;

    return res.status(201).json({
      success: true,
      traction: (issue as any).traction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return badRequestError(res, messages);
    }

    console.error("Error updating traction:", error);
    return serverError(res, "Failed to save traction data");
  }
});

// GET /api/blueprints/:slug/traction - Fetch traction data (public)
router.get("/:slug/traction", (req, res) => {
  try {
    const { slug } = req.params;

    const issue = issues.find((i: any) => i.slug === slug);
    if (!issue) {
      return notFoundError(res, "Blueprint not found");
    }

    return res.status(200).json({
      slug,
      traction: (issue as any).traction || null,
    });
  } catch (error) {
    console.error("Error fetching traction:", error);
    return serverError(res, "Failed to fetch traction data");
  }
});

export default router;
