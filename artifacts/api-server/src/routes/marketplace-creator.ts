import { Router } from "express";
import { db } from "@workspace/db";

const router = Router();

// Get marketplace newsletters
router.get("/", async (req, res) => {
  try {
    const { sort = "trending" } = req.query;

    // Mock data - in production, query database
    const newsletters = [
      {
        id: 1,
        name: "The Builder Brief",
        creatorName: "Yash Vardhan",
        description: "Weekly insights on scaling SaaS to $100M+",
        subscriberCount: 5200,
        price: 9.99,
        tags: ["SaaS", "Founders", "Growth"],
        isRaising: true,
        isSubscribed: false,
      },
      {
        id: 2,
        name: "AI Founders Weekly",
        creatorName: "Sarah Chen",
        description: "AI product updates every Friday",
        subscriberCount: 3400,
        price: 7.99,
        tags: ["AI", "Startups", "Tech"],
        isRaising: false,
        isSubscribed: false,
      },
      {
        id: 3,
        name: "Early-Stage Insights",
        creatorName: "Priya Patel",
        description: "Pre-seed to Series A playbook",
        subscriberCount: 2800,
        price: 12.99,
        tags: ["Venture", "Fundraising", "Strategy"],
        isRaising: true,
        isSubscribed: false,
      },
    ];

    const sorted = newsletters.sort((a, b) => {
      if (sort === "newest") return b.id - a.id;
      if (sort === "top-earnings") return b.subscriberCount - a.subscriberCount;
      if (sort === "raising") return (b.isRaising ? 1 : 0) - (a.isRaising ? 1 : 0);
      return b.subscriberCount - a.subscriberCount; // trending
    });

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch marketplace" });
  }
});

// Get creator profile
router.get("/creator/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Mock response
    res.json({
      id,
      name: "Yash Vardhan",
      bio: "Building the future of founder communication",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=yash",
      newsletters: 1,
      totalSubscribers: 5200,
      joinedDate: "2024-01-15",
      verified: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch creator" });
  }
});

export default router;
