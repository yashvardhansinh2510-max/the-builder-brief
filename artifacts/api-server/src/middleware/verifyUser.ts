import { Request, Response, NextFunction } from "express";
import { getAuth, createClerkClient } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const clerkUser = await clerk.users.getUser(userId);
    req.user = {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
    };
    next();
  } catch {
    res.status(401).json({ error: "Auth verification failed" });
  }
};
