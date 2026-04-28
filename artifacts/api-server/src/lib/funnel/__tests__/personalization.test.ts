import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePersonalizedContent } from "../personalization";
import { db } from "@/db";
import { playbookSegments } from "@/config/playbook-segments";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("Personalization Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePersonalizedContent", () => {
    it("should return B2B SaaS playbook for seed stage B2B founder", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user1",
          scorecardRunsLast30Days: 2,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const content = await generatePersonalizedContent(
        "user1",
        "seed",
        "b2b-saas",
        0
      );

      expect(content.primarySegment).toBeDefined();
      expect(content.primarySegment.markets).toContain("b2b-saas");
      expect(content.primarySegment.stages).toContain("seed");
      expect(content.relatedSegments.length).toBeGreaterThan(0);
      expect(content.focusAreas.length).toBeGreaterThan(0);
      expect(content.recommendation).toContain("discovery");
    });

    it("should return marketplace playbook for series-a founder", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user2",
          scorecardRunsLast30Days: 5,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const content = await generatePersonalizedContent(
        "user2",
        "series-a",
        "marketplace",
        50000
      );

      expect(content.primarySegment.markets).toContain("marketplace");
      expect(content.primarySegment.stages).toContain("series-a");
      expect(content.focusAreas).toContain("Unit economics refinement");
    });

    it("should suggest enterprise expansion for series-b B2B SaaS founder", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user3",
          scorecardRunsLast30Days: 10,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const content = await generatePersonalizedContent(
        "user3",
        "series-b",
        "b2b-saas",
        300000
      );

      expect(content.primarySegment).toBeDefined();
      expect(content.focusAreas).toContain("Operational scaling");
    });

    it("should include developer-tools specific recommendation", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          userId: "user4",
          scorecardRunsLast30Days: 3,
        },
      ]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const content = await generatePersonalizedContent(
        "user4",
        "series-a",
        "developer-tools",
        75000
      );

      expect(content.primarySegment.markets).toContain("developer-tools");
      expect(content.recommendation).toBeDefined();
    });

    it("should throw error if no matching segments", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      await expect(
        generatePersonalizedContent("user5", "seed", "consumer", 0)
      ).rejects.toThrow("No playbook segments found");
    });

    it("should differentiate recommendations based on MRR", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const lowMRRContent = await generatePersonalizedContent(
        "user6",
        "series-a",
        "b2b-saas",
        50
      );

      const highMRRContent = await generatePersonalizedContent(
        "user7",
        "series-a",
        "b2b-saas",
        300
      );

      expect(lowMRRContent.recommendation).not.toEqual(
        highMRRContent.recommendation
      );
      expect(lowMRRContent.focusAreas).not.toEqual(highMRRContent.focusAreas);
    });
  });
});
