import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkFreeToProEligibility,
  checkProToMaxEligibility,
  checkMaxToIncubatorEligibility,
} from "../eligibility";
import { db } from "@/db";
import { users, founderSignals, proMilestones } from "@/db/schema";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("Upgrade Eligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkFreeToProEligibility", () => {
    it("should mark Free user as eligible for Pro if they have 2+ scorecard runs", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "free" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "signal1",
          userId: "user1",
          scorecardRunsLast30Days: 2,
          playbookPagesViewedLast30Days: 0,
        },
      ]); // signals query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkFreeToProEligibility("user1");

      expect(result.isEligible).toBe(true);
      expect(result.tier).toBe("free");
      expect(result.triggerType).toBe("usage_pattern");
    });

    it("should mark Free user as eligible if they clicked 3+ playbook pages", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "free" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "signal1",
          userId: "user1",
          scorecardRunsLast30Days: 0,
          playbookPagesViewedLast30Days: 3,
        },
      ]); // signals query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkFreeToProEligibility("user1");

      expect(result.isEligible).toBe(true);
      expect(result.triggerType).toBe("playbook_clicks");
    });

    it("should mark Free user as eligible if they have 1+ scorecard run", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "free" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "signal1",
          userId: "user1",
          scorecardRunsLast30Days: 1,
          playbookPagesViewedLast30Days: 0,
        },
      ]); // signals query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkFreeToProEligibility("user1");

      expect(result.isEligible).toBe(true);
      expect(result.triggerType).toBe("health_score");
    });

    it("should mark Free user as ineligible if no usage", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "free" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "signal1",
          userId: "user1",
          scorecardRunsLast30Days: 0,
          playbookPagesViewedLast30Days: 0,
        },
      ]); // signals query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkFreeToProEligibility("user1");

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe("Not ready for upgrade yet");
    });

    it("should reject non-Free tier users", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "pro" }]); // user query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkFreeToProEligibility("user1");

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe("User is not on Free tier");
    });
  });

  describe("checkProToMaxEligibility", () => {
    it("should mark Pro user as eligible for Max if 2 milestones hit", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "pro" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "milestone1",
          userId: "user1",
          milestonesHit: 2,
        },
      ]); // milestones query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkProToMaxEligibility("user1");

      expect(result.isEligible).toBe(true);
      expect(result.tier).toBe("pro");
      expect(result.triggerType).toBe("milestone_hit");
    });

    it("should mark Pro user as ineligible if less than 2 milestones hit", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "pro" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "milestone1",
          userId: "user1",
          milestonesHit: 1,
        },
      ]); // milestones query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkProToMaxEligibility("user1");

      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain("Need 2 of 3 milestones");
    });

    it("should reject non-Pro tier users", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "free" }]); // user query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkProToMaxEligibility("user1");

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe("User is not on Pro tier");
    });
  });

  describe("checkMaxToIncubatorEligibility", () => {
    it("should mark Max user as eligible for Incubator if scout score >= 70", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "max" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "signal1",
          userId: "user1",
          consecutiveGrowthQuarters: 2,
          previousExits: 1,
          advisorCallsCompleted: 0,
          foundedBefore: false,
          estimatedTam: "$1B+",
          defensibility: "high",
        },
      ]); // signals query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkMaxToIncubatorEligibility("user1");

      expect(result.isEligible).toBe(true);
      expect(result.triggerType).toBe("scout_invite");
    });

    it("should mark Max user as ineligible if scout score < 70", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "max" }]); // user query
      mockLimit.mockResolvedValueOnce([
        {
          id: "signal1",
          userId: "user1",
          consecutiveGrowthQuarters: 0,
          previousExits: 0,
          advisorCallsCompleted: 0,
          foundedBefore: false,
          estimatedTam: "$10M",
          defensibility: "low",
        },
      ]); // signals query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkMaxToIncubatorEligibility("user1");

      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain("Need 70+ for Incubator");
    });

    it("should reject non-Max tier users", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "pro" }]); // user query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkMaxToIncubatorEligibility("user1");

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe("User is not on Max tier");
    });
  });
});
