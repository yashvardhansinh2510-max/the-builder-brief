import { db } from "@/db";
import { founderSignals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { playbookSegments, type PlaybookSegment } from "@/config/playbook-segments";

export interface PersonalizedContent {
  primarySegment: PlaybookSegment;
  relatedSegments: PlaybookSegment[];
  focusAreas: string[];
  recommendation: string;
}

export async function generatePersonalizedContent(
  userId: string,
  founderStage: "seed" | "series-a" | "series-b",
  market: "b2b-saas" | "marketplace" | "developer-tools" | "consumer",
  currentMRR: number
): Promise<PersonalizedContent> {
  const signals = await db
    .select()
    .from(founderSignals)
    .where(eq(founderSignals.userId, userId))
    .limit(1);

  // Determine content relevance based on stage and traction
  const stageFocusSegments = playbookSegments.filter((s) =>
    s.stages.includes(founderStage)
  );

  const marketSpecificSegments = stageFocusSegments.filter((s) =>
    s.markets.includes(market)
  );

  if (marketSpecificSegments.length === 0) {
    throw new Error(
      `No playbook segments found for stage=${founderStage}, market=${market}`
    );
  }

  // Primary segment: most relevant to current stage
  const primarySegment = marketSpecificSegments[0];

  // Related segments: other relevant playbooks
  const relatedSegments = marketSpecificSegments
    .slice(1, 3)
    .concat(
      stageFocusSegments.filter(
        (s) => !marketSpecificSegments.includes(s)
      )
    )
    .slice(0, 2);

  // Focus areas based on MRR and stage
  const focusAreas = determineFocusAreas(founderStage, currentMRR, market);

  // Generate personalized recommendation
  const recommendation = generateRecommendation(
    founderStage,
    currentMRR,
    market,
    primarySegment
  );

  return {
    primarySegment,
    relatedSegments,
    focusAreas,
    recommendation,
  };
}

function determineFocusAreas(
  stage: "seed" | "series-a" | "series-b",
  mrr: number,
  market: string
): string[] {
  const areas: string[] = [];

  if (stage === "seed") {
    areas.push("Customer discovery and validation");
    areas.push("MVP feature prioritization");
    if (mrr === 0) areas.push("Early pricing validation");
  }

  if (stage === "series-a") {
    if (mrr < 100) areas.push("Growth loop optimization");
    if (mrr > 0) areas.push("Unit economics refinement");
    areas.push("Founder team expansion");
  }

  if (stage === "series-b") {
    areas.push("Operational scaling");
    if (market === "b2b-saas") areas.push("Enterprise feature roadmap");
    areas.push("Board management and governance");
  }

  return areas;
}

function generateRecommendation(
  stage: "seed" | "series-a" | "series-b",
  mrr: number,
  market: string,
  primarySegment: PlaybookSegment
): string {
  if (stage === "seed") {
    return `You're in the discovery phase. The ${primarySegment.title} playbook breaks down exactly how founders in your position validate problems and find your first paying customers. Start with the customer discovery framework—that's where most founders get it wrong.`;
  }

  if (stage === "series-a") {
    if (mrr < 100) {
      return `Early in Series A, your focus is on proving repeatability. The ${primarySegment.title} playbook gives you the specific unit economics framework and distribution channels that work at your stage. The gap between $50k and $500k MRR is usually about optimizing this one playbook.`;
    }
    return `You're past initial traction. Time to scale. The ${primarySegment.title} playbook covers the exact distribution changes you need to make to hit $500k MRR. Pay special attention to the CAC and LTV frameworks.`;
  }

  return `At Series B, it's about operational excellence and market expansion. The ${primarySegment.title} playbook covers the specific playbook shifts required to stay profitable while scaling. Focus on unit economics and churn mitigation.`;
}
