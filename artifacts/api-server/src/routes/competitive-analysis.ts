import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { competitorAnalysisTable, founderProfilesTable } from '@workspace/db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

function toNumericString(val: string | number | undefined): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val.toString();
}

interface CompetitorAnalysisRequest {
  email: string;
  competitorName: string;
  productName: string;
  website?: string;
  industry: string;
  targetAudience: string;
}

interface OpenAICompetitorAnalysis {
  strengths: string;
  weaknesses: string;
  vulnerabilities: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    opportunity: string;
  }>;
  overallVulnerabilityScore: string | number;
  marketPosition: string;
  pricingStrategy: string;
  productFeatures: string;
  technicalStack: string;
  estimatedFunding: string | number;
  fundingStage: string;
  marketShare: string | number;
  growthRate: string | number;
  customerSentiment: string;
  analysisNotes: string;
}

interface CompetitorAnalysisResult {
  strengths: string;
  weaknesses: string;
  vulnerabilities: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    opportunity: string;
  }>;
  overallVulnerabilityScore: number;
  marketPosition: string;
  pricingStrategy: string;
  productFeatures: string;
  technicalStack: string;
  estimatedFunding: number;
  fundingStage: string;
  marketShare: number;
  growthRate: number;
  customerSentiment: string;
  analysisNotes: string;
}

async function generateCompetitorAnalysis(
  request: CompetitorAnalysisRequest
): Promise<CompetitorAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Analyze the competitor below and provide a detailed competitive analysis report:

Competitor Name: ${request.competitorName}
Product Name: ${request.productName}
Website: ${request.website || 'Not provided'}
Industry: ${request.industry}
Target Audience: ${request.targetAudience}

Please provide a comprehensive competitive analysis with:
1. Key Strengths (3-5 bullet points)
2. Weaknesses & Vulnerabilities (3-5 bullet points with severity levels: low, medium, high, critical)
3. Market Position Assessment (2-3 paragraphs)
4. Pricing Strategy Analysis (1-2 paragraphs)
5. Product Features Assessment (2-3 paragraphs)
6. Technical Stack Analysis (1-2 paragraphs if determinable)
7. Estimated Funding Stage (e.g., Seed, Series A, etc.)
8. Estimated Market Share percentage
9. Estimated Growth Rate (as percentage)
10. Customer Sentiment Analysis (positive/neutral/negative with reasoning)
11. Actionable Analysis Notes for competitive advantage

Format your response as JSON with these exact keys: strengths, weaknesses, vulnerabilities (array of objects with category, description, severity, opportunity), overallVulnerabilityScore (0-100), marketPosition, pricingStrategy, productFeatures, technicalStack, estimatedFunding, fundingStage, marketShare, growthRate, customerSentiment, analysisNotes`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: { message?: string } };
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = (await response.json()) as { choices: Array<{ message?: { content?: string } }> };
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as OpenAICompetitorAnalysis;
    const toNumber = (val: string | number | undefined): number => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      return parseInt(val) || 0;
    };

    return {
      strengths: analysis.strengths || '',
      weaknesses: analysis.weaknesses || '',
      vulnerabilities: analysis.vulnerabilities || [],
      overallVulnerabilityScore: toNumber(analysis.overallVulnerabilityScore),
      marketPosition: analysis.marketPosition || '',
      pricingStrategy: analysis.pricingStrategy || '',
      productFeatures: analysis.productFeatures || '',
      technicalStack: analysis.technicalStack || '',
      estimatedFunding: toNumber(analysis.estimatedFunding),
      fundingStage: analysis.fundingStage || '',
      marketShare: toNumber(analysis.marketShare),
      growthRate: toNumber(analysis.growthRate),
      customerSentiment: analysis.customerSentiment || '',
      analysisNotes: analysis.analysisNotes || '',
    };
  } catch (error) {
    console.error('Competitor analysis generation error:', error);
    throw error;
  }
}

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { email, competitorName, productName, website, industry, targetAudience } =
      req.body as CompetitorAnalysisRequest;

    if (!email || !competitorName || !productName || !industry || !targetAudience) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analysis = await generateCompetitorAnalysis({
      email,
      competitorName,
      productName,
      website,
      industry,
      targetAudience,
    });

    const reportData = {
      userId: email,
      competitorName,
      productName,
      website: website || null,
      industry,
      targetAudience,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      vulnerabilities: analysis.vulnerabilities,
      overallVulnerabilityScore: toNumericString(analysis.overallVulnerabilityScore),
      marketPosition: analysis.marketPosition,
      pricingStrategy: analysis.pricingStrategy,
      productFeatures: analysis.productFeatures,
      technicalStack: analysis.technicalStack,
      estimatedFunding: toNumericString(analysis.estimatedFunding),
      fundingStage: analysis.fundingStage,
      marketShare: toNumericString(analysis.marketShare),
      growthRate: toNumericString(analysis.growthRate),
      customerSentiment: analysis.customerSentiment,
      analysisNotes: analysis.analysisNotes,
      analyzedAt: new Date(),
    };

    const [report] = await db
      .insert(competitorAnalysisTable)
      .values(reportData)
      .returning({ id: competitorAnalysisTable.id });

    return res.json({
      success: true,
      reportId: report.id,
      analysis,
    });
  } catch (error) {
    console.error('Competitor analysis error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate competitor analysis',
    });
  }
});

router.get('/report/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const report = await db
      .select()
      .from(competitorAnalysisTable)
      .where(eq(competitorAnalysisTable.id, parseInt(id)))
      .limit(1);

    if (report.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json(report[0]);
  } catch (error) {
    console.error('Report fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.get('/latest/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };

    const reports = await db
      .select()
      .from(competitorAnalysisTable)
      .where(eq(competitorAnalysisTable.userId, email))
      .orderBy(desc(competitorAnalysisTable.analyzedAt))
      .limit(1);

    if (reports.length === 0) {
      return res.status(404).json({ error: 'No reports found' });
    }

    return res.json(reports[0]);
  } catch (error) {
    console.error('Latest report fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch latest report' });
  }
});

export default router;
