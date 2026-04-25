import express, { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "../lib/logger";
import { verifyUser } from "../middleware/verifyUser";

const router: IRouter = Router();

// Initialize Stripe and Razorpay with keys from environment
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27" as any })
  : null;

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * POST /api/payments/create-session
 * Creates a Stripe Checkout Session or a Razorpay Order
 */
router.post("/payments/create-session", verifyUser, async (req: Request, res: Response): Promise<void> => {
  const email = req.user?.email;
  const { plan, region } = req.body;

  if (!email || !plan) {
    res.status(400).json({ error: "Email and plan are required" });
    return;
  }

  const prices: Record<string, { usd: number; inr: number }> = {
    "Pro": { usd: 999, inr: 99900 },
    "Max": { usd: 4900, inr: 499900 },
    "Incubator": { usd: 19900, inr: 1999900 },
  };

  const selectedPrice = prices[plan];
  if (!selectedPrice) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  try {
    if (region === "IN" && razorpay) {
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
    } else if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `The Builder Brief: ${plan}`,
                description: `Subscription to ${plan} blueprints and insights.`,
              },
              unit_amount: selectedPrice.usd,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        customer_email: email,
        success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/pricing`,
        metadata: { email, plan },
        subscription_data: {
          metadata: { email, plan },
        },
      });

      res.json({ provider: "stripe", url: session.url });
    } else {
      res.status(501).json({ error: "Payment providers not configured" });
    }
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

/**
 * POST /api/payments/webhook-stripe
 * Stripe Webhook handler
 */
router.post("/payments/webhook-stripe", express.raw({ type: "application/json" }), async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe or Webhook secret not configured");
    }
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    logger.error({ err }, "Webhook signature verification failed");
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email;
    const plan = session.metadata?.plan;

    if (email && plan) {
      try {
        await db.update(subscribersTable)
          .set({
            tier: plan.toLowerCase().replace(" ", "_"),
            paymentProvider: "stripe",
            lastPaymentAt: new Date()
          })
          .where(eq(subscribersTable.email, email));

        logger.info({ email, plan }, "Subscription updated via Stripe Webhook");
      } catch (error) {
        logger.error({ error }, "Error updating subscriber tier from Stripe webhook");
      }
    }
  } else if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    const obj = event.data.object as any;
    let email = obj.customer_email || obj.metadata?.email;

    // If we only have customer ID / subscription ID without email, fetch it
    if (!email && obj.subscription) {
      try {
        const sub = await stripe.subscriptions.retrieve(obj.subscription as string);
        email = sub.metadata?.email;
      } catch (e) {
        logger.error({ e }, "Failed to fetch subscription for downgrade email resolution");
      }
    }

    if (email) {
      try {
        await db.update(subscribersTable)
          .set({ tier: "free" })
          .where(eq(subscribersTable.email, email));
        logger.info({ email, event: event.type }, "User downgraded to free tier");
      } catch (error) {
        logger.error({ error }, "Error downgrading subscriber tier");
      }
    } else {
      logger.warn({ event: event.type, id: obj.id }, "Could not resolve email for downgrade webhook");
    }
  }

  res.json({ received: true });
});

export default router;
