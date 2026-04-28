import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateScoutScore,
  identifyScoutCandidates,
  updateScoutScore,
} from "../scouts";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

describe("Scout Identification and Scoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateScoutScore", () => {
    it("should calculate growth trajectory from scorecard runs", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user1",
          scorecardRunsLast30Days: 12,
          networkConnectionsCount: 60,
          contentPublishedCount: 3,
          lastActiveAt: new Date(),
          founderMarket: "b2b-saas",
          founderStage: "series-b",
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const score = await calculateScoutScore("user1");

      expect(score.growthTrajectory).toBe(30);
      expect(score.reasons).toContain("High engagement with scorecard (10+ runs)");
    });

    it("should calculate credibility from network and content", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user2",
          scorecardRunsLast30Days: 5,
          networkConnectionsCount: 50,
          contentPublishedCount: 5,
          lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          founderMarket: "marketplace",
          founderStage: "series-a",
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const score = await calculateScoutScore("user2");

      expect(score.credibility).toBeGreaterThan(0);
      expect(score.reasons).toContain("Strong founder network (50+ connections)");
      expect(score.reasons).toContain("Active content creator (5+ pieces)");
      expect(score.reasons).toContain("Active this week");
    });

    it("should calculate market opportunity from stage and market", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user3",
          scorecardRunsLast30Days: 8,
          networkConnectionsCount: 30,
          contentPublishedCount: 2,
          lastActiveAt: new Date(),
          founderMarket: "developer-tools",
          founderStage: "series-b",
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const score = await calculateScoutScore("user3");

      expect(score.marketOpportunity).toBeGreaterThan(0);
      expect(score.reasons).toContain(
        "Operating in high-opportunity market: developer-tools"
      );
      expect(score.reasons).toContain("Series B founder (scale phase)");
    });

    it("should mark as invitable when score >= 70", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user4",
          scorecardRunsLast30Days: 10,
          networkConnectionsCount: 60,
          contentPublishedCount: 5,
          lastActiveAt: new Date(),
          founderMarket: "b2b-saas",
          founderStage: "series-b",
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const score = await calculateScoutScore("user4");

      expect(score.totalScore).toBeGreaterThanOrEqual(70);
      expect(score.isInvitable).toBe(true);
    });

    it("should not be invitable when score < 70", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user5",
          scorecardRunsLast30Days: 1,
          networkConnectionsCount: 5,
          contentPublishedCount: 0,
          lastActiveAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          founderMarket: "consumer",
          founderStage: "seed",
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const score = await calculateScoutScore("user5");

      expect(score.isInvitable).toBe(false);
    });

    it("should return zero score when no signals found", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const score = await calculateScoutScore("unknown");

      expect(score.totalScore).toBe(0);
      expect(score.isInvitable).toBe(false);
    });

    it("should provide detailed reasons array", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user6",
          scorecardRunsLast30Days: 8,
          networkConnectionsCount: 25,
          contentPublishedCount: 3,
          lastActiveAt: new Date(),
          founderMarket: "b2b-saas",
          founderStage: "series-a",
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const score = await calculateScoutScore("user6");

      expect(score.reasons.length).toBeGreaterThan(0);
      expect(Array.isArray(score.reasons)).toBe(true);
    });
  });

  describe("identifyScoutCandidates", () => {
    it("should return only invitable scouts from max tier users", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue([
        {
          userId: "maxuser1",
          scorecardRunsLast30Days: 10,
          networkConnectionsCount: 60,
        },
        {
          userId: "maxuser2",
          scorecardRunsLast30Days: 2,
          networkConnectionsCount: 5,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const candidates = await identifyScoutCandidates();

      expect(Array.isArray(candidates)).toBe(true);
      expect(candidates.every((c) => c.score.isInvitable)).toBe(true);
    });
  });

  describe("updateScoutScore", () => {
    it("should persist scout score to database", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi
        .fn()
        .mockReturnThis()
        .mockResolvedValueOnce([
          {
            userId: "user7",
            scorecardRunsLast30Days: 8,
            networkConnectionsCount: 45,
            contentPublishedCount: 3,
            lastActiveAt: new Date(),
            founderMarket: "b2b-saas",
            founderStage: "series-b",
          },
        ])
        .mockResolvedValueOnce([{ userId: "user7" }]);

      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockWhere });

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      (db.select as any).mockReturnValue({ from: mockFrom });
      (db.update as any).mockReturnValue(mockUpdate);

      const score = await updateScoutScore("user7");

      expect(score).toBeDefined();
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
    });
  });
});
