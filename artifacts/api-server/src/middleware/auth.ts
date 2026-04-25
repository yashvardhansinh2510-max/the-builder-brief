import { Request, Response, NextFunction } from "express";

/**
 * Admin authentication middleware.
 * Checks for valid admin token in Authorization header or environment.
 *
 * Expects header format: Authorization: Bearer <ADMIN_TOKEN>
 * Token should match process.env.ADMIN_TOKEN
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    res.status(500).json({ error: "Admin token not configured" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  if (token !== adminToken) {
    res.status(403).json({ error: "Invalid admin token" });
    return;
  }

  next();
};
