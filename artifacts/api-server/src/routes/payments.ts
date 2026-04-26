import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "../lib/logger";
import { verifyUser } from "../middleware/verifyUser";

const router: IRouter = Router();

// Initialize Razorpay with keys from environment
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * POST /api/payments/create-session
 * Creates a Razorpay Order
 */
router.post("/payments/create-session", verifyUser, async (req: Request, res: Response): Promise<void> => {
  const email = req.user?.email;
  const { plan } = req.body;

  if (!email || !plan) {
    res.status(400).json({ error: "Email and plan are required" });
    return;
  }

  const prices: Record<string, { inr: number }> = {
    "Pro": { inr: 99900 },
    "Max": { inr: 499900 },
    "Incubator": { inr: 1999900 },
  };

  const selectedPrice = prices[plan];
  if (!selectedPrice) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  try {
    if (!razorpay) {
      res.status(501).json({ error: "Payment provider not configured" });
      return;
    }

    const order = await razorpay.orders.create({
      amount: selectedPrice.inr,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { email, plan }
    });

    res.json({
      provider: "razorpay",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    logger.error({ error }, "Error creating payment session");
    res.status(500).json({ error: "Failed to create payment session" });
  }
});

/**
 * POST /api/payments/verify-razorpay
 * Verifies the Razorpay signature and updates the DB
 */
router.post("/payments/verify-razorpay", verifyUser, async (req: Request, res: Response): Promise<void> => {
  const email = req.user?.email;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  if (!razorpay_order_id || !razorpay_signature || !email) {
    res.status(400).json({ error: "Missing verification details" });
    return;
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    try {
      await db.update(subscribersTable)
        .set({
          tier: plan.toLowerCase().replace(" ", "_"),
          paymentProvider: "razorpay",
          lastPaymentAt: new Date()
        })
        .where(eq(subscribersTable.email, email));

      res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
      logger.error({ error }, "Error updating subscriber tier after Razorpay success");
      res.status(500).json({ error: "Database update failed" });
    }
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
});

export default router;
