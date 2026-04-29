import { db } from "@/db";
import { advisorAssignments, founderSignals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { advisorRoster, type AdvisorProfile } from "@/config/advisors";

export async function assignAdvisorForMaxTier(
  userId: string,
  founderStage: "seed" | "series-a" | "series-b",
  market: "b2b-saas" | "marketplace" | "developer-tools" | "consumer"
): Promise<AdvisorProfile> {
  const candidateAdvisors = advisorRoster.filter(
    (advisor) =>
      advisor.stages.includes(founderStage) && advisor.markets.includes(market)
  );

  if (candidateAdvisors.length === 0) {
    throw new Error(
      `No advisors available for stage=${founderStage}, market=${market}`
    );
  }

  // Pick advisor with most available slots
  const selectedAdvisor = candidateAdvisors.reduce((prev, current) =>
    current.quarterlySlots > prev.quarterlySlots ? current : prev
  );

  // Record assignment
  const assignmentDate = new Date();
  const nextCheckInDate = new Date();
  nextCheckInDate.setDate(nextCheckInDate.getDate() + 90);

  await db.insert(advisorAssignments).values({
    id: `advisor-${userId}-${Date.now()}`,
    userId,
    advisorId: selectedAdvisor.id,
    advisorName: selectedAdvisor.name,
    assignedAt: assignmentDate,
    lastCheckInAt: null,
    nextQuarterlyCheckIn: nextCheckInDate,
  });

  return selectedAdvisor;
}

export async function getAssignedAdvisor(userId: string): Promise<AdvisorProfile | null> {
  const assignment = await db
    .select()
    .from(advisorAssignments)
    .where(eq(advisorAssignments.userId, userId))
    .limit(1);

  if (!assignment || assignment.length === 0) {
    return null;
  }

  const advisor = advisorRoster.find(
    (a) => a.id === assignment[0].advisorId
  );

  return advisor || null;
}

export async function recordCheckIn(
  userId: string,
  advisorId: string
): Promise<void> {
  const nextCheckIn = new Date();
  nextCheckIn.setDate(nextCheckIn.getDate() + 90);

  await db
    .update(advisorAssignments)
    .set({
      lastCheckInAt: new Date(),
      nextQuarterlyCheckIn: nextCheckIn,
    })
    .where(eq(advisorAssignments.userId, userId));
}

export async function getAdvisorByMarketAndStage(
  market: "b2b-saas" | "marketplace" | "developer-tools" | "consumer",
  stage: "seed" | "series-a" | "series-b"
): Promise<AdvisorProfile> {
  const candidates = advisorRoster.filter(
    (a) => a.markets.includes(market) && a.stages.includes(stage)
  );

  if (candidates.length === 0) {
    throw new Error(`No advisors found for market=${market}, stage=${stage}`);
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
