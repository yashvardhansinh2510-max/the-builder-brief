import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../api-server/.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OUTPUT_FILE = path.resolve(__dirname, '../src/lib/generated-vaults.json');

const ELITE_PROMPT = `
You are an elite Silicon Valley venture capitalist and deep-tech researcher. Your job is to identify highly lucrative, extreme-niche B2B SaaS, Climate Tech, Health Tech, or GovTech opportunities that ordinary founders overlook.

DO NOT generate "AI slop" or generic ideas (e.g., no "AI for HR", no "To-do lists", no "Social media schedulers").
The ideas must be "goldmines" — regulatory loopholes, extreme inefficiencies in obscure industries (like deep-sea cable inspection, nitrogen compliance, cross-border VAT, dental supply chains).

Generate 5 MASSIVE, deeply researched startup blueprints in JSON format.

The output MUST be a JSON array of objects matching this exact interface:
[{
  "slug": "unique-kebab-case-string",
  "number": 100, // Increment this for each one
  "category": "B2B SaaS | HealthTech | GovTech | ClimateTech | FinTech | DeepTech",
  "title": "A highly specific, impressive title",
  "tagline": "A punchy, 1-sentence value prop",
  "tam": "e.g., $4.2B",
  "revenueIn": "e.g., 60 Days",
  "problem": "Deeply technical or regulatory explanation of the friction.",
  "whyNow": ["3 specific, non-obvious reasons why the timing is perfect now (e.g., a new 2026 EU mandate)."],
  "blueprint": ["5 step-by-step execution guides from 0 to launch."],
  "prompts": ["3 elite, highly-technical prompts to paste into Claude to generate the MVP code."],
  "firstRevenue": "How to get the first dollar.",
  "firstTen": "How to get the first 10 enterprise customers.",
  "difficulty": "High" or "Extreme",
  "capital": "Seed ($1k-$10k)" or "Venture ($10k+)",
  "devTime": "Months",
  "techStack": [ { "name": "Tool", "category": "Frontend/Backend/etc", "description": "Why this tool specifically" } ],
  "competitors": [ { "name": "Incumbent", "weakness": "Their exact technical or business vulnerability" } ],
  "monetization": [ { "tier": "Name", "price": "Price", "description": "Details" } ],
  "regionalNuance": [ { "region": "Name", "insight": "Specific regulatory/market insight" } ],
  "graphTitle": "A title for a Recharts graph (e.g., Market Velocity vs Incumbent Failures)",
  "graphData": [ { "name": "2023", "value": 10 }, { "name": "2024", "value": 50 }, { "name": "2025", "value": 150 }, { "name": "2026", "value": 400 } ],
  "marketingStrategy": [ { "platform": "Platform", "action": "Action", "hook": "The exact script/hook" } ],
  "revenueMilestones": [ { "target": "$10,000 ARR", "milestone": "Metric", "focus": "Actionable focus" }, { "target": "$100,000 ARR", "milestone": "Metric", "focus": "Action" }, { "target": "$1M ARR", "milestone": "Metric", "focus": "Action" } ],
  "unitEconomics": { "cac": "$XXX", "ltv": "$XXX", "margin": "XX%", "paybackPeriod": "X Months" },
  "risks": [ { "type": "Regulatory", "description": "Risk", "mitigation": "Solution" } ],
  "growthLoops": [ "2-3 highly specific product-led growth mechanics." ]
}]

Ensure the JSON is perfectly valid and deeply researched.
`;

async function generateBatch(batchNum, startNumber) {
  console.log(`Generating batch ${batchNum}...`);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an AI that outputs pure JSON. Your output must be an object with a 'vaults' key containing the array of ideas." },
        { role: "user", content: ELITE_PROMPT + `\n\nStart numbering the ideas at ${startNumber}.` }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.vaults || [];
  } catch (error) {
    console.error("Error generating batch:", error);
    return [];
  }
}

async function main() {
  const TOTAL_IDEAS_NEEDED = 20; // For the initial burst, we'll do 20 to ensure it doesn't timeout. We can run it multiple times to hit 100.
  const BATCH_SIZE = 5;
  let allVaults = [];
  
  if (fs.existsSync(OUTPUT_FILE)) {
     try {
       const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
       allVaults = existing;
       console.log(`Found ${existing.length} existing vaults.`);
     } catch(e) {}
  }

  let currentNumber = 100 + allVaults.length;

  for (let i = 0; i < TOTAL_IDEAS_NEEDED / BATCH_SIZE; i++) {
    const batch = await generateBatch(i + 1, currentNumber);
    if (batch.length > 0) {
      allVaults.push(...batch);
      currentNumber += batch.length;
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allVaults, null, 2));
      console.log(`Saved batch ${i + 1}. Total vaults: ${allVaults.length}`);
    } else {
      console.log("Batch failed, retrying...");
      i--; // Retry
    }
    // Sleep to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("Generation complete!");
}

main();
