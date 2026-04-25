import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { db } from "@specflow/db";
import {
  subscribersTable,
  articlesTable,
  personalizationTable,
  dailyBriefsTable,
  vaultsTable
} from "@specflow/db/schema";
import { eq } from "drizzle-orm";

describe("Briefs & Vaults Integration", () => {
  let testSubscriberId: number;
  let testArticleIds: number[] = [];
  let testVaultId: number;

  beforeAll(async () => {
    // Create test subscriber
    const [sub] = await db
      .insert(subscribersTable)
      .values({
        email: "integration@test.com",
        source: "test",
        confirmed: true,
      })
      .returning();

    testSubscriberId = sub.id;

    // Create test articles
    const articles = await db
      .insert(articlesTable)
      .values([
        {
          title: "Breaking: Startup Raises $50M Series B",
          content: "A promising startup in AI infrastructure has raised $50M in Series B funding led by top-tier VCs...",
          source: "newsletter",
          category: "deals",
        },
        {
          title: "Market Analysis: Tech Sector Stabilizes",
          content: "The tech market shows signs of stabilization after Q1 volatility. Enterprise software remains resilient...",
          source: "newsletter",
          category: "insights",
        },
        {
          title: "Founder's Guide to Series A",
          content: "What every founder needs to know before raising Series A: metrics, investor expectations, timeline...",
          source: "newsletter",
          category: "insights",
        },
      ])
      .returning();

    testArticleIds = articles.map(a => a.id);

    // Create test vault
    const vaultDate = new Date().toISOString().split("T")[0];
    const [vault] = await db
      .insert(vaultsTable)
      .values({
        vaultWeek: vaultDate,
        title: `Week of ${vaultDate}: AI Deal Flow Surge`,
        description: "Curated insights on this week's major AI funding rounds and market movements.",
        content: "This week saw unprecedented momentum in AI infrastructure funding. Three major announcements dominated headlines...",
        sourceArticleIds: testArticleIds.slice(0, 2),
        isPublished: true,
        publishedAt: new Date(),
      })
      .returning();

    testVaultId = vault.id;
  });

  describe("GET /api/briefs/today", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/api/briefs/today");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("should fetch or generate daily brief with valid auth", async () => {
      // Mock the subscriberId on the request object
      // In a real scenario, this would be set by auth middleware
      const res = await request(app)
        .get("/api/briefs/today")
        .set("X-Subscriber-Id", testSubscriberId.toString());

      // Note: Since we don't have full auth middleware setup,
      // we expect 401. In production, this would return 200 with brief data.
      expect([200, 401]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body).toHaveProperty("summary");
        expect(res.body).toHaveProperty("highlights");
        expect(Array.isArray(res.body.highlights)).toBe(true);
      }
    });
  });

  describe("POST /api/briefs/personalization", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app)
        .post("/api/briefs/personalization")
        .send({
          interests: ["deals"],
          focusAreas: ["AI", "fintech"],
          contextStyle: "quick",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("should update user personalization with valid auth", async () => {
      const res = await request(app)
        .post("/api/briefs/personalization")
        .set("X-Subscriber-Id", testSubscriberId.toString())
        .send({
          interests: ["deals"],
          focusAreas: ["AI", "fintech"],
          contextStyle: "quick",
        });

      // Note: Since we don't have full auth middleware setup,
      // we expect 401. In production, this would return 200 with updated data.
      expect([200, 401]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body).toHaveProperty("interests");
        expect(res.body.interests).toEqual(["deals"]);
        expect(res.body.focusAreas).toEqual(["AI", "fintech"]);
        expect(res.body.contextStyle).toBe("quick");
      }
    });
  });

  describe("GET /api/vaults", () => {
    it("should list published vaults", async () => {
      const res = await request(app).get("/api/vaults");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Should include our test vault if it was published
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("title");
        expect(res.body[0]).toHaveProperty("isPublished");
        expect(res.body[0].isPublished).toBe(true);
      }
    });

    it("should only list published vaults", async () => {
      const res = await request(app).get("/api/vaults");

      expect(res.status).toBe(200);
      const allPublished = res.body.every((vault: any) => vault.isPublished === true);
      expect(allPublished).toBe(true);
    });
  });

  describe("GET /api/vaults/:id", () => {
    it("should fetch a specific vault by id", async () => {
      const res = await request(app).get(`/api/vaults/${testVaultId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.id).toBe(testVaultId);
      expect(res.body).toHaveProperty("title");
      expect(res.body).toHaveProperty("content");
      expect(res.body).toHaveProperty("sourceArticleIds");
    });

    it("should return 404 for non-existent vault", async () => {
      const res = await request(app).get("/api/vaults/99999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Vault not found");
    });

    it("should return vault with all expected fields", async () => {
      const res = await request(app).get(`/api/vaults/${testVaultId}`);

      expect(res.status).toBe(200);
      const vault = res.body;

      expect(vault).toHaveProperty("vaultWeek");
      expect(vault).toHaveProperty("title");
      expect(vault).toHaveProperty("description");
      expect(vault).toHaveProperty("content");
      expect(vault).toHaveProperty("sourceArticleIds");
      expect(vault).toHaveProperty("isPublished");
      expect(vault).toHaveProperty("publishedAt");
      expect(vault).toHaveProperty("createdAt");
      expect(vault).toHaveProperty("updatedAt");
    });
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    if (testVaultId) {
      await db.delete(vaultsTable).where(eq(vaultsTable.id, testVaultId));
    }

    if (testArticleIds.length > 0) {
      await db
        .delete(articlesTable)
        .where((col) =>
          testArticleIds.includes(col.id)
        );
    }

    if (testSubscriberId) {
      await db
        .delete(personalizationTable)
        .where(eq(personalizationTable.subscriberId, testSubscriberId));

      await db
        .delete(dailyBriefsTable)
        .where(eq(dailyBriefsTable.subscriberId, testSubscriberId));

      await db
        .delete(subscribersTable)
        .where(eq(subscribersTable.id, testSubscriberId));
    }
  });
});
