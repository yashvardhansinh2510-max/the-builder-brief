import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateMilestoneProgress, getMilestoneProgress } from "../milestones";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

describe("Milestone Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateMilestoneProgress", () => {
    it("should mark MRR target as hit when currentMRR >= 500", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user1",
          currentMRR: 0,
          activeUsers: 400,
          mrrTargetHit: false,
          usersTargetHit: false,
          featureShippedHit: false,
          milestonesHit: 0,
          maxUpgradeEligibleAt: null,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const mockUpdateSet = vi.fn().mockReturnThis();
      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
      (db.update as any).mockReturnValue({ set: mockUpdateSet });

      await updateMilestoneProgress("user1", { currentMRR: 550 });

      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          mrrTargetHit: true,
          milestonesHit: 1,
        })
      );
    });

    it("should trigger Max upgrade eligibility when 2+ milestones are hit", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user1",
          currentMRR: 600,
          activeUsers: 400,
          mrrTargetHit: true,
          usersTargetHit: false,
          featureShippedHit: false,
          milestonesHit: 1,
          maxUpgradeEligibleAt: null,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const mockUpdateSet = vi.fn().mockReturnThis();
      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
      (db.update as any).mockReturnValue({ set: mockUpdateSet });

      await updateMilestoneProgress("user1", { activeUsers: 550 });

      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          milestonesHit: 2,
          maxUpgradeEligibleAt: expect.any(Date),
        })
      );
    });

    it("should mark all three milestones when each target is met", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user1",
          currentMRR: 400,
          activeUsers: 400,
          mrrTargetHit: false,
          usersTargetHit: false,
          featureShippedHit: true,
          milestonesHit: 1,
          maxUpgradeEligibleAt: null,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const mockUpdateSet = vi.fn().mockReturnThis();
      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
      (db.update as any).mockReturnValue({ set: mockUpdateSet });

      await updateMilestoneProgress("user1", {
        currentMRR: 500,
        activeUsers: 500,
      });

      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          mrrTargetHit: true,
          usersTargetHit: true,
          milestonesHit: 3,
          maxUpgradeEligibleAt: expect.any(Date),
        })
      );
    });
  });

  describe("getMilestoneProgress", () => {
    it("should return milestone progress with correct structure", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user1",
          currentMRR: 300,
          activeUsers: 250,
          mrrTargetHit: false,
          usersTargetHit: false,
          featureShippedHit: false,
          milestonesHit: 0,
          maxUpgradeEligibleAt: null,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const progress = await getMilestoneProgress("user1");

      expect(progress).toEqual({
        mrrTarget: {
          achieved: 300,
          target: 500,
          isHit: false,
        },
        usersTarget: {
          achieved: 250,
          target: 500,
          isHit: false,
        },
        featureShipped: false,
        milestonesHit: 0,
      });
    });

    it("should throw error if milestone record not found", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      await expect(getMilestoneProgress("nonexistent")).rejects.toThrow(
        "No milestone record found"
      );
    });
  });
});
