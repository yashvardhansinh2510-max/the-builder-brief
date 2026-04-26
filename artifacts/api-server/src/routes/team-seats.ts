import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { db, teamSeats, subscribersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// Create team seat invite
router.post("/team/seats/invite", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    const userIdNum = parseInt(userId, 10);

    // Check user tier has team seats available
    const user = await db
      .select({ tier: subscribersTable.tier })
      .from(subscribersTable)
      .where(eq(subscribersTable.id, userIdNum));

    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userTier = user[0].tier || "free";
    if (userTier === "free") {
      return res.status(403).json({ error: "Team seats not available on free tier" });
    }

    // Count existing active seats
    const existingSeats = await db
      .select()
      .from(teamSeats)
      .where(
        and(
          eq(teamSeats.userId, userIdNum),
          eq(teamSeats.status, "active")
        )
      );

    // Free: 0, Pro: 1, Max: 10, Incubator: unlimited
    const maxSeats = userTier === "pro" ? 1 : userTier === "max" ? 10 : -1;
    if (maxSeats !== -1 && existingSeats.length >= maxSeats) {
      return res.status(403).json({
        error: `Team seat limit reached for ${userTier} tier`,
        current: existingSeats.length,
        limit: maxSeats,
      });
    }

    const seat = await db
      .insert(teamSeats)
      .values({
        userId: userIdNum,
        invitedEmail: email.toLowerCase(),
        role: role.toLowerCase(),
        status: "pending",
      })
      .returning();

    return res.json({ success: true, seat: seat[0] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create seat invite" });
  }
});

// Get team seats
router.get("/team/seats", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const userIdNum = parseInt(userId, 10);

    const seats = await db
      .select()
      .from(teamSeats)
      .where(eq(teamSeats.userId, userIdNum));

    const activeSeatCount = seats.filter((s) => s.status === "active").length;
    const pendingInvites = seats.filter((s) => s.status === "pending").length;

    return res.json({
      seats,
      activeSeatCount,
      pendingInvites,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch team seats" });
  }
});

// Accept team seat invite (invitee accepts)
router.post("/team/seats/accept/:seatId", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { seatId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!seatId) return res.status(400).json({ error: "Seat ID is required" });

    const seatIdNum = parseInt(seatId, 10);

    // Verify email matches
    const seat = await db
      .select()
      .from(teamSeats)
      .where(eq(teamSeats.id, seatIdNum));

    if (!seat.length) {
      return res.status(404).json({ error: "Seat invite not found" });
    }

    if (seat[0].invitedEmail !== req.user?.email) {
      return res.status(403).json({ error: "This invite is not for your email" });
    }

    const updated = await db
      .update(teamSeats)
      .set({
        status: "active",
        acceptedAt: new Date(),
        teamMemberId: parseInt(userId, 10),
      })
      .where(eq(teamSeats.id, seatIdNum))
      .returning();

    return res.json({ success: true, seat: updated[0] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to accept seat invite" });
  }
});

// Update team seat role
router.put("/team/seats/:id", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { role } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!id) return res.status(400).json({ error: "Seat ID is required" });
    if (!role) return res.status(400).json({ error: "Role is required" });

    const userIdNum = parseInt(userId, 10);
    const seatId = parseInt(id, 10);

    // Verify ownership
    const seat = await db
      .select()
      .from(teamSeats)
      .where(
        and(
          eq(teamSeats.id, seatId),
          eq(teamSeats.userId, userIdNum)
        )
      );

    if (!seat.length) {
      return res.status(404).json({ error: "Seat not found" });
    }

    const updated = await db
      .update(teamSeats)
      .set({ role: role.toLowerCase() })
      .where(eq(teamSeats.id, seatId))
      .returning();

    return res.json({ success: true, seat: updated[0] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update seat" });
  }
});

// Remove team seat
router.delete("/team/seats/:id", verifyUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!id) return res.status(400).json({ error: "Seat ID is required" });

    const userIdNum = parseInt(userId, 10);
    const seatId = parseInt(id, 10);

    // Verify ownership
    const seat = await db
      .select()
      .from(teamSeats)
      .where(
        and(
          eq(teamSeats.id, seatId),
          eq(teamSeats.userId, userIdNum)
        )
      );

    if (!seat.length) {
      return res.status(404).json({ error: "Seat not found" });
    }

    await db.delete(teamSeats).where(eq(teamSeats.id, seatId));

    return res.json({ success: true, message: "Team seat removed" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to remove seat" });
  }
});

export default router;
