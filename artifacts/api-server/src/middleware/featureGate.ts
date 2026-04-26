import { Request, Response, NextFunction } from "express";
import { canUseFeature, incrementFeatureUsage } from "../lib/featureGates";

export interface AuthRequest extends Request {
  userId?: number;
  userTier?: string;
}

export function featureGateMiddleware(featureKey: string, incrementUsage: boolean = true) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { allowed, reason } = await canUseFeature(req.userId, featureKey);

      if (!allowed) {
        return res.status(403).json({ error: "Feature not available", reason });
      }

      // Increment usage if enabled
      if (incrementUsage) {
        const result = await incrementFeatureUsage(req.userId, featureKey);
        if (!result.success) {
          console.warn(`Failed to track usage for feature ${featureKey}`);
        }
      }

      next();
    } catch (error) {
      console.error("Feature gate middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export function requireTier(...tiers: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userTier || !tiers.includes(req.userTier)) {
      return res.status(403).json({
        error: "This feature requires a higher tier",
        requiredTier: tiers[0],
        currentTier: req.userTier,
      });
    }
    next();
  };
}
