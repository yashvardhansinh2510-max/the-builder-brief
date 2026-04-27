import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAndNotifyFreeToProEligibility } from "../eligibility";
import { db } from "@/db";
import { Resend } from "resend";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock("resend", () => ({
  Resend: vi.fn(),
}));

describe("Email Triggers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAndNotifyFreeToProEligibility", () => {
    it("should send email if user is eligible for Free→Pro upgrade", async () => {
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

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue({ id: "offer_123" });
      mockInsert.mockReturnValue({ values: mockValues });
      (db.insert as any).mockReturnValue(mockInsert);

      const mockResendSend = vi.fn().mockResolvedValue({ id: "email_123" });
      const mockResendEmails = { send: mockResendSend };
      (Resend as any).mockImplementation(() => ({
        emails: mockResendEmails,
      }));

      const result = await checkAndNotifyFreeToProEligibility("user1");

      expect(result.sent).toBe(true);
      expect(result.offerId).toBeDefined();
      expect(mockInsert).toHaveBeenCalled();
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "founders@thebuilderbrief.com",
          subject: "You're ready to unlock Pro insights",
        })
      );
    });

    it("should not send email if user is not eligible", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn();

      mockLimit.mockResolvedValueOnce([{ id: "user1", tier: "pro" }]); // user query

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await checkAndNotifyFreeToProEligibility("user1");

      expect(result.sent).toBe(false);
      expect(result.reason).toBe("User is not on Free tier");
    });

    it("should create upgrade offer record with correct expiry", async () => {
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

      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue({ id: "offer_123" });
      mockInsert.mockReturnValue({ values: mockValues });
      (db.insert as any).mockReturnValue(mockInsert);

      (Resend as any).mockImplementation(() => ({
        emails: { send: vi.fn().mockResolvedValue({ id: "email_123" }) },
      }));

      await checkAndNotifyFreeToProEligibility("user1");

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user1",
          fromTier: "free",
          toTier: "pro",
          expiresAt: expect.any(Date),
        })
      );

      const callArgs = mockValues.mock.calls[0][0];
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      expect(callArgs.expiresAt.getDate()).toBe(expiresAt.getDate());
    });
  });
});
