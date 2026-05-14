import { config } from "dotenv";
import { resolve } from "path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

config({ path: resolve(process.cwd(), ".env") });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PROMPT_TEMPLATE = `
You are a world-class venture capitalist and AI strategist focusing on the European and Global B2B SaaS, Climate Tech, and Fintech markets.
Your task is to generate 5 completely original, highly specific, and extremely lucrative startup blueprints.
Do not generate generic ideas like "AI for HR" or "CRM for Plumbers." They must be highly technical, regulatory-driven, or deep tech.

Format the output strictly as a JSON array of objects with the following schema:
[
  {
    "title": "Startup Name",
    "slug": "startup-name",
    "category": "B2B SaaS | Fintech | Climate Tech | Health | AI-Native",
    "tam": "e.g., $15B TAM",
    "revenueIn": "e.g., 14 days",
    "tagline": "One sentence highly specific hook.",
    "problem": "Deep analysis of the problem. Mention specific EU/US regulations or market shifts.",
    "whyNow": ["Point 1", "Point 2", "Point 3"],
    "tam_detail": "Detailed breakdown of the market size and competitors.",
    "blueprint": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    "prompts": ["Prompt 1", "Prompt 2", "Prompt 3"],
    "firstRevenue": "Exact strategy to get the first dollar.",
    "firstTen": "Exact strategy to get the first 10 customers."
  }
]
`;

async function generateBatch(batchNum) {
  console.log(`\n🤖 Generating Batch ${batchNum} (5 Blueprints)...`);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: PROMPT_TEMPLATE }],
      response_format: { type: "json_object" }, // Force JSON
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message.content;
    let data;
    try {
      // Sometimes it returns a bare array, sometimes wrapped in an object like { blueprints: [] }
      const parsed = JSON.parse(rawContent);
      data = Array.isArray(parsed) ? parsed : Object.values(parsed)[0];
    } catch (e) {
      console.error("Failed to parse JSON response:", rawContent);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return [];
  }
}

async function insertIntoSupabase(blueprints) {
  console.log(`💾 Inserting ${blueprints.length} blueprints into the vault...`);
  
  for (const bp of blueprints) {
    // We map the blueprint object to the expected 'vaults' schema
    const vaultRecord = {
      id: randomUUID(),
      title: bp.title,
      summary: bp.tagline,
      description: bp.problem,
      content: JSON.stringify(bp), // Store the full rich data
      source_types: [bp.category],
      avg_confidence: 0.85 + (Math.random() * 0.14), // Random high confidence 85-99%
      trend_direction: "Up",
      source_urls: [],
      vault_week: new Date().toISOString().split('T')[0],
      source_article_ids: []
    };

    const { error } = await supabase
      .from('vaults')
      .insert(vaultRecord);

    if (error) {
      console.error(`❌ Failed to insert ${bp.title}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${bp.title}`);
    }
  }
}

async function runSeeder(totalBatches = 20) {
  console.log(`🚀 Starting AI Seeding Engine for The Builder Brief`);
  console.log(`Target: ${totalBatches * 5} Total Blueprints\n`);

  let totalInserted = 0;

  for (let i = 1; i <= totalBatches; i++) {
    const blueprints = await generateBatch(i);
    if (blueprints && blueprints.length > 0) {
      await insertIntoSupabase(blueprints);
      totalInserted += blueprints.length;
    }
    
    // Add a 5 second delay between batches to respect rate limits
    if (i < totalBatches) {
      console.log(`⏳ Waiting 5 seconds before next batch...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  console.log(`\n🎉 Seeding Complete! Successfully generated and inserted ${totalInserted} startup blueprints.`);
}

// Run the seeder (default 20 batches of 5 = 100 blueprints)
// To run manually: node scripts/generate-blueprints.js
runSeeder(20).catch(console.error);
