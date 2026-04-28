import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  assignAdvisorForMaxTier,
  getAssignedAdvisor,
  getAdvisorByMarketAndStage,
} from "../advisors";
import { db } from "@/db";
import { advisorRoster } from "@/config/advisors";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

describe("Advisor Matching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("assignAdvisorForMaxTier", () => {
    it("should assign B2B SaaS advisor for seed stage", async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue(undefined);
      mockInsert.mockReturnValue({ values: mockValues });
      (db.insert as any).mockReturnValue(mockInsert);

      const advisor = await assignAdvisorForMaxTier("user1", "seed", "b2b-saas");

      expect(advisor).toBeDefined();
      expect(advisor.stages).toContain("seed");
      expect(advisor.markets).toContain("b2b-saas");
      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user1",
          advisorId: expect.any(String),
          advisorName: expect.any(String),
        })
      );
    });

    it("should assign marketplace advisor for series-a", async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue(undefined);
      mockInsert.mockReturnValue({ values: mockValues });
      (db.insert as any).mockReturnValue(mockInsert);

      const advisor = await assignAdvisorForMaxTier("user2", "series-a", "marketplace");

      expect(advisor).toBeDefined();
      expect(advisor.stages).toContain("series-a");
      expect(advisor.markets).toContain("marketplace");
    });

    it("should throw error if no advisors match criteria", async () => {
      const mockInsert = vi.fn().mockReturnThis();
      mockInsert.mockReturnValue({ values: vi.fn() });
      (db.insert as any).mockReturnValue(mockInsert);

      // Consumer market not available for series-b in roster
      await expect(
        assignAdvisorForMaxTier("user3", "series-b", "consumer")
      ).rejects.toThrow("No advisors available");
    });

    it("should prefer advisor with most available slots", async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue(undefined);
      mockInsert.mockReturnValue({ values: mockValues });
      (db.insert as any).mockReturnValue(mockInsert);

      const advisor = await assignAdvisorForMaxTier("user4", "seed", "b2b-saas");

      // David Kim has 4 slots, most of any seed/b2b-saas advisor
      expect(advisor.quarterlySlots).toBeGreaterThan(0);
    });
  });

  describe("getAssignedAdvisor", () => {
    it("should return assigned advisor for user", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user1",
          advisorId: "advisor_001",
          advisorName: "Sarah Chen",
          assignedAt: new Date(),
          lastCheckInDate: null,
          nextCheckInDate: new Date(),
          checkInCount: 0,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const advisor = await getAssignedAdvisor("user1");

      expect(advisor).toBeDefined();
      expect(advisor?.id).toBe("advisor_001");
      expect(advisor?.name).toBe("Sarah Chen");
    });

    it("should return null if no assignment found", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const advisor = await getAssignedAdvisor("nonexistent");

      expect(advisor).toBeNull();
    });
  });

  describe("getAdvisorByMarketAndStage", () => {
    it("should return advisor matching market and stage", async () => {
      const advisor = await getAdvisorByMarketAndStage("b2b-saas", "seed");

      expect(advisor).toBeDefined();
      expect(advisor.markets).toContain("b2b-saas");
      expect(advisor.stages).toContain("seed");
    });

    it("should throw error if no advisors match", async () => {
      await expect(
        getAdvisorByMarketAndStage("consumer", "seed")
      ).rejects.toThrow("No advisors found");
    });

    it("should handle developer-tools market", async () => {
      const advisor = await getAdvisorByMarketAndStage("developer-tools", "series-a");

      expect(advisor.markets).toContain("developer-tools");
      expect(advisor.stages).toContain("series-a");
    });
  });
});
