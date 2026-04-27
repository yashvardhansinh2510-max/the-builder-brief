import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { marketSizingReportsTable, founderProfilesTable } from '@workspace/db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

interface AnalysisRequest {
  email: string;
  productDescription: string;
  industry: string;
  targetMarket: string;
}

interface OpenAIAnalysis {
  tam: { estimate: string | number; reasoning: string; source: string };
  sam: { estimate: string | number; reasoning: string; serviceable: string };
  som: { estimate: string | number; reasoning: string; firstYear: string };
  marketTrends: string;
  competitorAnalysis: string;
  growthOpportunities: string;
  risks: string;
  analysis: string;
}

interface MarketAnalysisResult {
  tam: { estimate: number; reasoning: string; source: string };
  sam: { estimate: number; reasoning: string; serviceable: string };
  som: { estimate: number; reasoning: string; firstYear: string };
  marketTrends: string;
  competitorAnalysis: string;
  growthOpportunities: string;
  risks: string;
  analysis: string;
}

async function generateMarketAnalysis(request: AnalysisRequest): Promise<MarketAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Analyze the market opportunity for the following product and provide a detailed market sizing report:

Product Description: ${request.productDescription}
Industry: ${request.industry}
Target Market: ${request.targetMarket}

Please provide:
1. Total Addressable Market (TAM) - estimate in USD with reasoning and source
2. Serviceable Available Market (SAM) - estimate in USD with reasoning
3. Serviceable Obtainable Market (SOM) - first year estimate with strategy
4. Current Market Trends (2-3 paragraphs)
5. Competitive Landscape Analysis (2-3 paragraphs)
6. Growth Opportunities (3-5 bullet points)
7. Risks and Challenges (3-5 bullet points)

Format your response as JSON with these exact keys: tam, sam, som, marketTrends, competitorAnalysis, growthOpportunities, risks, analysis`;

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
        max_tokens: 2000,
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

    // Try to parse the response as JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as OpenAIAnalysis;
    const toNumber = (val: string | number | undefined): number => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      return parseInt(val) || 0;
    };
    return {
      tam: {
        estimate: toNumber(analysis.tam?.estimate),
        reasoning: analysis.tam?.reasoning || '',
        source: analysis.tam?.source || '',
      },
      sam: {
        estimate: toNumber(analysis.sam?.estimate),
        reasoning: analysis.sam?.reasoning || '',
        serviceable: analysis.sam?.serviceable || '',
      },
      som: {
        estimate: toNumber(analysis.som?.estimate),
        reasoning: analysis.som?.reasoning || '',
        firstYear: analysis.som?.firstYear || '',
      },
      marketTrends: analysis.marketTrends || '',
      competitorAnalysis: analysis.competitorAnalysis || '',
      growthOpportunities: analysis.growthOpportunities || '',
      risks: analysis.risks || '',
      analysis: analysis.analysis || '',
    };
  } catch (error) {
    console.error('Market analysis generation error:', error);
    throw error;
  }
}

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { email, productDescription, industry, targetMarket } = req.body as AnalysisRequest;

    if (!email || !productDescription || !industry || !targetMarket) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const profile = await db
      .select()
      .from(founderProfilesTable)
      .where(eq(founderProfilesTable.userId, email))
      .limit(1);

    const companyName = profile[0]?.companyName || 'Unknown';

    const analysis = await generateMarketAnalysis({
      email,
      productDescription,
      industry,
      targetMarket,
    });

    // Save report to database
    const reportData = {
      userId: email,
      companyName,
      industry,
      productDescription,
      targetMarket,
      tam: analysis.tam,
      sam: analysis.sam,
      som: analysis.som,
      marketTrends: analysis.marketTrends,
      competitorAnalysis: analysis.competitorAnalysis,
      growthOpportunities: analysis.growthOpportunities,
      risks: analysis.risks,
      analysis: analysis.analysis,
      generatedAt: new Date(),
    };

    const [report] = await db
      .insert(marketSizingReportsTable)
      .values(reportData)
      .returning({ id: marketSizingReportsTable.id });

    return res.json({
      success: true,
      reportId: report.id,
      analysis,
    });
  } catch (error) {
    console.error('Market analysis error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate market analysis',
    });
  }
});

router.get('/report/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const report = await db
      .select()
      .from(marketSizingReportsTable)
      .where(eq(marketSizingReportsTable.id, parseInt(id)))
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
      .from(marketSizingReportsTable)
      .where(eq(marketSizingReportsTable.userId, email))
      .orderBy(desc(marketSizingReportsTable.createdAt))
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
