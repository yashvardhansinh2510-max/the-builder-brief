import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { db, teamSeatsTable, subscribersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  parseId,
  requireParsedId,
  unauthorizedError,
  badRequestError,
  forbiddenError,
  notFoundError,
  serverError,
  successResponse,
} from "../utils";

const router = Router();

// Create team seat invite
router.post("/team/seats/invite", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorizedError(res);

    const { email, role } = req.body;
    if (!email || !role) {
      return badRequestError(res, "Email and role are required");
    }

    const userIdNum = requireParsedId(userId);

    // Check user tier has team seats available
    const user = await db
      .select({ tier: subscribersTable.tier })
      .from(subscribersTable)
      .where(eq(subscribersTable.id, userIdNum));

    if (!user.length) {
      return notFoundError(res, "User");
    }

    const userTier = user[0].tier || "free";
    if (userTier === "free") {
      return forbiddenError(res, "Team seats not available on free tier");
    }

    // Count existing active seats
    const existingSeats = await db
      .select()
      .from(teamSeatsTable)
      .where(
        and(
          eq(teamSeatsTable.teamOwnerId, userIdNum),
          eq(teamSeatsTable.status, "active")
        )
      );

    const maxSeats = userTier === "pro" ? 1 : userTier === "max" ? 10 : Infinity;
    if (maxSeats !== Infinity && existingSeats.length >= maxSeats) {
      return forbiddenError(
        res,
        `Team seat limit reached for ${userTier} tier (current: ${existingSeats.length}, limit: ${maxSeats})`
      );
    }

    const seat = await db
      .insert(teamSeatsTable)
      .values({
        teamOwnerId: userIdNum,
        teamMemberEmail: email.toLowerCase(),
        role: role.toLowerCase(),
        status: "pending",
      })
      .returning();

    return successResponse(res, { success: true, seat: seat[0] });
  } catch (error) {
    return serverError(res, "Failed to create seat invite", error);
  }
});

// Get team seats
router.get("/team/seats", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorizedError(res);

    const userIdNum = requireParsedId(userId);

    const seats = await db
      .select()
      .from(teamSeatsTable)
      .where(eq(teamSeatsTable.teamOwnerId, userIdNum));

    const activeSeatCount = seats.filter((s) => s.status === "active").length;
    const pendingInvites = seats.filter((s) => s.status === "pending").length;

    return successResponse(res, {
      seats,
      activeSeatCount,
      pendingInvites,
    });
  } catch (error) {
    return serverError(res, "Failed to fetch team seats", error);
  }
});

// Accept team seat invite (invitee accepts)
router.post("/team/seats/accept/:seatId", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { seatId } = req.params;

    if (!userId) return unauthorizedError(res);
    if (!seatId) return badRequestError(res, "Seat ID is required");

    const id = typeof seatId === "string" ? seatId : seatId[0];
    const userIdNum = requireParsedId(userId);

    // Verify email matches
    const seat = await db
      .select()
      .from(teamSeatsTable)
      .where(eq(teamSeatsTable.id, id));

    if (!seat.length) {
      return notFoundError(res, "Seat invite");
    }

    if (seat[0].teamMemberEmail !== req.user?.email) {
      return forbiddenError(res, "This invite is not for your email");
    }

    const updated = await db
      .update(teamSeatsTable)
      .set({
        status: "active",
        updatedAt: new Date(),
        teamMemberId: userIdNum,
      })
      .where(eq(teamSeatsTable.id, id))
      .returning();

    return successResponse(res, { success: true, seat: updated[0] });
  } catch (error) {
    return serverError(res, "Failed to accept seat invite", error);
  }
});

// Update team seat role
router.put("/team/seats/:id", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { role } = req.body;

    if (!userId) return unauthorizedError(res);
    if (!id) return badRequestError(res, "Seat ID is required");
    if (!role) return badRequestError(res, "Role is required");

    const userIdNum = requireParsedId(userId);
    const idStr = typeof id === "string" ? id : id[0];

    // Verify ownership
    const seat = await db
      .select()
      .from(teamSeatsTable)
      .where(
        and(
          eq(teamSeatsTable.id, idStr),
          eq(teamSeatsTable.teamOwnerId, userIdNum)
        )
      );

    if (!seat.length) {
      return notFoundError(res, "Seat");
    }

    const updated = await db
      .update(teamSeatsTable)
      .set({ role: role.toLowerCase() })
      .where(eq(teamSeatsTable.id, idStr))
      .returning();

    return successResponse(res, { success: true, seat: updated[0] });
  } catch (error) {
    return serverError(res, "Failed to update seat", error);
  }
});

// Remove team seat
router.delete("/team/seats/:id", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return unauthorizedError(res);
    if (!id) return badRequestError(res, "Seat ID is required");

    const userIdNum = requireParsedId(userId);
    const idStr = typeof id === "string" ? id : id[0];

    // Verify ownership
    const seat = await db
      .select()
      .from(teamSeatsTable)
      .where(
        and(
          eq(teamSeatsTable.id, idStr),
          eq(teamSeatsTable.teamOwnerId, userIdNum)
        )
      );

    if (!seat.length) {
      return notFoundError(res, "Seat");
    }

    await db.delete(teamSeatsTable).where(eq(teamSeatsTable.id, idStr));

    return successResponse(res, { success: true, message: "Team seat removed" });
  } catch (error) {
    return serverError(res, "Failed to remove seat", error);
  }
});

export default router;
