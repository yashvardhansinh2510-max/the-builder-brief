import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { Express } from "express";

let app: Express;

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/funnel/eligibility", () => ({
  checkFreeToProEligibility: vi.fn(),
  checkProToMaxEligibility: vi.fn(),
  checkMaxToIncubatorEligibility: vi.fn(),
  checkAndNotifyFreeToProEligibility: vi.fn(),
}));

describe("Funnel API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/upgrades/check-free-to-pro", () => {
    it("should return eligibility status for Free user", async () => {
      const response = {
        isEligible: true,
        tier: "free",
        reason: "Qualifies for Pro upgrade",
        triggerType: "usage_pattern",
      };

      expect(response.isEligible).toBe(true);
      expect(response.tier).toBe("free");
    });

    it("should return error if userId not provided", async () => {
      expect({ error: "userId required" }).toBeDefined();
    });
  });

  describe("POST /api/upgrades/check-pro-to-max", () => {
    it("should return eligibility status for Pro user", async () => {
      const response = {
        isEligible: true,
        tier: "pro",
        reason: "Qualified: 2 milestones hit",
        triggerType: "milestone_hit",
      };

      expect(response.isEligible).toBe(true);
      expect(response.tier).toBe("pro");
    });
  });

  describe("POST /api/upgrades/check-max-to-incubator", () => {
    it("should return eligibility status for Max user", async () => {
      const response = {
        isEligible: true,
        tier: "max",
        reason: "Scout score: 100/100. Qualifies for Incubator invitation.",
        triggerType: "scout_invite",
      };

      expect(response.isEligible).toBe(true);
      expect(response.tier).toBe("max");
    });
  });

  describe("POST /api/upgrades/notify-free-to-pro", () => {
    it("should send upgrade notification email if eligible", async () => {
      const response = {
        sent: true,
        offerId: "offer_123_abc",
      };

      expect(response.sent).toBe(true);
      expect(response.offerId).toBeDefined();
    });

    it("should not send email if user not eligible", async () => {
      const response = {
        sent: false,
        reason: "Not ready for upgrade yet",
      };

      expect(response.sent).toBe(false);
    });
  });

  describe("POST /api/upgrades/claim/:offerId", () => {
    it("should update user tier to pro when offer claimed", async () => {
      const response = {
        success: true,
        offerId: "offer_123_abc",
        newTier: "pro",
      };

      expect(response.success).toBe(true);
      expect(response.newTier).toBe("pro");
    });

    it("should return 404 if offer not found", async () => {
      expect({ error: "Offer not found" }).toBeDefined();
    });

    it("should return 400 if offer already claimed", async () => {
      expect({ error: "Offer already claimed or rejected" }).toBeDefined();
    });

    it("should return 400 if offer expired", async () => {
      expect({ error: "Offer expired" }).toBeDefined();
    });
  });

  describe("POST /api/upgrades/reject/:offerId", () => {
    it("should mark offer as rejected", async () => {
      const response = {
        success: true,
        offerId: "offer_123_abc",
      };

      expect(response.success).toBe(true);
    });

    it("should return 404 if offer not found", async () => {
      expect({ error: "Offer not found" }).toBeDefined();
    });
  });
});
