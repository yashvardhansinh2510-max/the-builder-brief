export const issues = [
  {
    number: "008",
    slug: "rentshield",
    title: "RentShield",
    category: "B2B SaaS",
    tam: "$40B TAM",
    revenueIn: "14 days",
    tagline: "AI reads 10,000 comparable leases so renters know exactly what to push back on before signing.",
    problem: "Renters have zero leverage in lease negotiations. They sign whatever the landlord puts in front of them because they have no data. Comparable lease data exists — it's just buried in court filings, public records, and proprietary databases that tenants can't access. The average renter leaves $3,000–$8,000 on the table per lease by failing to negotiate clauses they could have pushed back on.",
    whyNow: [
      "Rental prices hit all-time highs in 2023-2024 — renters are desperate for any edge",
      "LLMs can now read, parse, and compare legal documents at scale with high accuracy",
      "Remote work opened multi-city flexibility, creating a new class of mobile renters who negotiate frequently"
    ],
    tam_detail: "$40B TAM across residential and commercial lease advisory. The legal services market for tenant advocacy is ~$2B and completely undigitized. Zero direct competitors using AI to analyze comparable leases at this specificity.",
    blueprint: [
      "Scrape 10,000 public lease documents from court records and property databases",
      "Fine-tune an LLM to extract clause types, terms, and negotiation outcomes",
      "Build a simple upload UI: user uploads their lease PDF",
      "Return a redlined comparison showing which clauses are above/below market",
      "Add a 'negotiation script' that tells them exactly what to say to their landlord",
      "Charge $29/lease analysis, or $99/year for unlimited + landlord database access"
    ],
    prompts: [
      "You are a tenant rights expert. I am uploading my lease. Identify every clause that is above market rate for [city, unit type]. For each clause, tell me: (1) what the market standard is, (2) the exact language to request, and (3) the likelihood my landlord will agree.",
      "Compare these two lease documents and identify the top 5 clauses where Lease A is more favorable than Lease B. Format as a table with: clause name, Lease A terms, Lease B terms, which is better and why.",
      "I need to negotiate my rent. My landlord is asking $[X]. Based on [number] comparable units in [neighborhood], what is my best anchor offer, what concessions should I request instead of price cuts, and what will make me seem credible?"
    ],
    firstRevenue: "Charge $29 per lease analysis on day one. Post in r/renting, r/personalfinance, and Blind. Offer 3 free analyses to real estate Twitter influencers for reviews. First customer in 72 hours. Target: 50 paying customers in 14 days = $1,450.",
    firstTen: "Post in three subreddits (r/renting, r/NYCapartments, r/LAapartments) with a genuine post: 'I built a tool that reads your lease and tells you what to negotiate — first 5 people get it free if you post your results.' Repeat in 10 cities. You get real testimonials and your first customers simultaneously."
  },
  {
    number: "007",
    slug: "refundradar",
    title: "RefundRadar",
    category: "Fintech",
    tam: "$12B TAM",
    revenueIn: "7 days",
    tagline: "AI agent audits SaaS invoices, finds overcharges, and files refunds automatically — takes 30% of whatever it recovers.",
    problem: "Every company overpays on SaaS by an average of 28%. Duplicate charges, unused seat licenses, incorrect tier upgrades, and auto-renewals on cancelled services bleed thousands monthly. The finance team doesn't have time to audit 40 SaaS invoices every month. The average SMB wastes $15,000–$50,000 per year on SaaS overcharges they never dispute.",
    whyNow: [
      "SaaS sprawl exploded — companies now average 130+ SaaS tools, up from 16 in 2015",
      "AI can now read invoices and match them to contract terms with high precision",
      "Economic pressure in 2024 is forcing CFOs to audit every line item — perfect timing"
    ],
    tam_detail: "$12B TAM in SaaS spend management. Vendr, Zylo, and Cleanshelf exist but charge flat subscriptions and don't work on contingency. Zero contingency-fee competitors in the automated refund space.",
    blueprint: [
      "Connect to Gmail/Outlook to pull all SaaS invoices from the past 24 months",
      "Parse invoices with an LLM to extract vendor, amount, date, and charge type",
      "Cross-reference against the company's SaaS contracts and user counts",
      "Flag discrepancies: overcharges, unused seats, post-cancellation charges",
      "Draft and send refund request emails automatically on behalf of the company",
      "Invoice 30% of all recovered funds; get paid only when they get paid"
    ],
    prompts: [
      "You are a SaaS invoice auditor. I am sharing 12 months of invoices from Salesforce. Identify: (1) any charges that don't match our contract tier, (2) months where we were billed for more seats than we used, (3) any charges after our documented cancellation date. For each finding, calculate the overcharge amount and draft a refund request email.",
      "Review this SaaS invoice and our user count data. Calculate: are we on the right pricing tier? If we downgraded to [tier], how much would we save annually? Draft an email to the vendor requesting the tier adjustment and any retroactive credit.",
      "I believe we were charged after cancelling this service. Here is the cancellation email thread and the subsequent invoices. Draft a firm but professional refund demand letter citing consumer protection precedents."
    ],
    firstRevenue: "LinkedIn DM 20 finance directors at Series A–B startups. Subject line: 'We found $12k in overcharges for a company like yours last week — want us to check yours for free?' First audit is free. You take 30% of whatever you recover. Target: recover $40k in week one, earn $12k.",
    firstTen: "Partner with one bookkeeper or CFO-as-a-service firm. They introduce you to 10 clients. You split 50% of your recovery fee with them. They love it because it's free money they can offer clients. You get 10 customers without cold outreach."
  },
  {
    number: "006",
    slug: "trialmatch",
    title: "TrialMatch",
    category: "Health",
    tam: "$8B TAM",
    revenueIn: "30 days",
    tagline: "Matches qualifying patients to clinical trial slots using their existing medical records.",
    problem: "62% of clinical trial slots go unfilled while millions of qualifying patients never hear about them. Pharmaceutical companies lose $8M per day per delayed trial. Patients miss access to cutting-edge treatments. The matching problem is complex: eligibility criteria are written in dense medical language that patients can't parse and that existing databases don't match automatically.",
    whyNow: [
      "LLMs can now parse complex medical eligibility criteria and match against patient records",
      "FDA pressure accelerating trial timelines means pharma will pay a premium for faster recruitment",
      "Patient advocacy groups are pushing hard for broader trial access — regulatory tailwinds"
    ],
    tam_detail: "$8B TAM in clinical trial recruitment. Antidote and TrialSpark exist but are expensive and slow. The AI-native matching layer that works on existing patient records is unclaimed.",
    blueprint: [
      "Scrape ClinicalTrials.gov for all active trials with open enrollment (80,000+ studies)",
      "Parse eligibility criteria with an LLM into structured inclusion/exclusion rules",
      "Build a patient-facing portal where they upload their medical records (HIPAA compliant)",
      "Match patient records against parsed criteria and rank matches by fit score",
      "Alert patients by email/SMS with their top 3–5 matches and application instructions",
      "Charge pharma companies $500–$2,000 per qualified referral"
    ],
    prompts: [
      "You are a clinical trial matching specialist. Here are the eligibility criteria for Trial NCT[number]. Here is a patient summary. Score this patient's eligibility from 0-100 on each criterion. Flag any disqualifying conditions immediately. Identify criteria where we need more information.",
      "Parse these clinical trial eligibility criteria and convert them into a structured JSON format with: inclusion_criteria (array), exclusion_criteria (array), required_tests (array), age_range, and required_diagnosis_codes (ICD-10).",
      "A patient with [conditions] and [medications] is interested in cancer trials. Search for relevant trials, rank by eligibility match, and write a plain-English summary for each — no jargon, written for a non-medical reader."
    ],
    firstRevenue: "Contact 3 CROs (contract research organizations) and offer to send them 10 qualified referrals for free. When they confirm quality, charge $500/referral going forward. The CRO is your first distribution channel.",
    firstTen: "Post in 5 patient advocacy Facebook groups for specific conditions (MS, cancer, rare diseases). Offer free matching. Collect 200 patient profiles. Send the best matches to CROs for free. Document the outcomes. Use those outcomes as your case study for paid contracts."
  },
  {
    number: "005",
    slug: "contractpulse",
    title: "ContractPulse",
    category: "B2B SaaS",
    tam: "$18B TAM",
    revenueIn: "14 days",
    tagline: "AI monitors all vendor contracts, alerts before auto-renew clauses, and writes renegotiation briefs.",
    problem: "Procurement teams miss vendor contract renewals constantly. Auto-renew clauses cost companies billions annually. The average enterprise has 300+ vendor contracts spread across email threads, shared drives, and DocuSign accounts. Nobody owns the renewal calendar. When the renewal date hits, it's either missed (and they're locked in for another year) or discovered too late to renegotiate properly.",
    whyNow: [
      "Contract lifecycle management software costs $50k+/year — SMBs have nothing",
      "AI can now extract, parse, and calendar contract terms from PDFs at scale",
      "CFO pressure post-2022 means every company is trying to cut vendor costs — this is the tool"
    ],
    tam_detail: "$18B CLM market. DocuSign CLM, Ironclad, and ContractWorks serve enterprise at $50k+. The AI-native SMB layer (under $5k/year) is completely open.",
    blueprint: [
      "Connect to Google Drive, Dropbox, and email to ingest all vendor contracts",
      "Extract key terms: renewal dates, auto-renew clauses, notice periods, pricing",
      "Build a unified contract dashboard showing all contracts, dates, and renewal windows",
      "Send alerts at 90, 60, 30, and 7 days before renewal/notice deadlines",
      "Generate renegotiation briefs using market pricing data and renewal leverage analysis",
      "Charge $299/month for up to 50 contracts; $499/month for unlimited"
    ],
    prompts: [
      "You are a contract analyst. Extract from this vendor contract: (1) contract start date, (2) end date, (3) auto-renewal clause text and notice period, (4) pricing and escalation terms, (5) termination conditions. Output as structured JSON.",
      "I have 30 days before my auto-renewal with [vendor]. Our contract is $[X]/month. I want to negotiate to $[Y]. Write a renegotiation brief including: our usage data, comparable market pricing, our leverage points, the exact email to send, and what to say if they push back.",
      "Compare these three vendor contracts for the same service category. Rank them by: total cost over 3 years, flexibility (exit clauses), SLA strength, and renewal risk. Recommend which terms to renegotiate on the worst contract."
    ],
    firstRevenue: "Cold email 50 Ops Managers and Finance Directors at Series A–C startups. Subject: 'You have a contract renewing in 30 days that you don't know about.' Offer a free audit: you manually review their contracts and find the next 3 renewal dates for free. Then pitch the software.",
    firstTen: "Partner with 3 startup CPAs or fractional CFOs. They introduce you to clients. You offer a white-labeled version they can pitch as their own service. They get 30% rev share. You get 10 customers without doing any direct sales."
  },
  {
    number: "004",
    slug: "voiceclone-executives",
    title: "VoiceClone for Executives",
    category: "AI-Native",
    tam: "$6B TAM",
    revenueIn: "7 days",
    tagline: "AI trains on their past writing and emails to ghostwrite LinkedIn in their exact voice — indistinguishable from them.",
    problem: "Every C-suite exec needs a LinkedIn presence but has zero time. A CEO with 50k followers who posts 3x/week generates measurable recruiting, sales, and fundraising outcomes. Most executives know this but post inconsistently or not at all. Ghostwriters charge $3,000–$8,000/month and still don't sound right. The exec has to spend 30 minutes per post reviewing and editing — which defeats the purpose.",
    whyNow: [
      "LinkedIn's algorithm now heavily favors personal accounts over company pages — executives are the new brand",
      "LLMs can now accurately mimic writing style with 20–30 examples",
      "Every VC and recruiting firm is pushing executives to build personal brands — demand is explicit"
    ],
    tam_detail: "$6B executive communications market. Ghost-writing agencies exist but charge $3k+/month. AI writing tools (Jasper, Writer) don't specialize in executive voice cloning. Gap: AI-native, exec-specific, voice-trained ghostwriter.",
    blueprint: [
      "Collect 30 days of the executive's past writing: emails, LinkedIn posts, interview transcripts",
      "Fine-tune a prompt template that captures their vocabulary, cadence, and opinion style",
      "Build a simple intake form: topic, key point, target emotion (inspire/educate/provoke)",
      "Generate 3 post options per topic in their exact voice",
      "One-click approval and scheduling directly to LinkedIn",
      "Charge $1,500/month for 12 posts/month; $2,500/month for 20 posts"
    ],
    prompts: [
      "You are ghostwriting for [Executive Name], [Title] at [Company]. Their writing style: [3 example posts]. Write a LinkedIn post about [topic]. Requirements: sounds exactly like them, not like a press release. First sentence must stop the scroll. No hashtag spam. Under 250 words. Three options.",
      "Analyze these 20 LinkedIn posts written by [name]. Extract: (1) their most common sentence structures, (2) words they use repeatedly, (3) how they open posts, (4) their opinion signature (how they frame takes), (5) what topics they avoid. Create a style guide I can use to ghostwrite for them.",
      "The executive wants to comment on [current news/trend]. Write 3 comment options in their voice: one that agrees with nuance, one that respectfully disagrees, one that asks a thought-provoking question. Each under 100 words. Sound like a person, not a press release."
    ],
    firstRevenue: "DM 20 CEOs/founders on LinkedIn with genuine praise for a specific post, then: 'I built an AI that would have written this post in 4 minutes in your exact voice. Want to see a demo?' Demo is a live post draft for them on a topic they pick. Close at $1,500/month.",
    firstTen: "Contact 10 executive coaches and leadership consultants. Offer them a white-labeled version they can sell to their clients as a $2,000/month add-on. They already have the clients and the trust. You provide the product. Split the revenue 50/50."
  },
  {
    number: "003",
    slug: "skillgap-oracle",
    title: "SkillGap Oracle",
    category: "Education",
    tam: "$22B TAM",
    revenueIn: "21 days",
    tagline: "AI maps the exact learning path from where someone is today to where a specific job requires them to be.",
    problem: "Hiring managers reject candidates without knowing if a 3-week course would close the gap. Candidates apply to jobs they're 80% qualified for and never hear back — with no understanding of what the missing 20% is. Existing skill assessment tools tell you where you are. Nobody tells you the exact path to where you need to be — with specific resources, timelines, and costs.",
    whyNow: [
      "AI/ML and cybersecurity job markets have skills gaps measured in millions of unfilled roles",
      "LLMs can now compare job requirements to resumes and generate specific learning plans",
      "Bootcamp fatigue — people want targeted upskilling, not 12-week generalist programs"
    ],
    tam_detail: "$22B online education market. LinkedIn Learning and Coursera show courses but don't map to specific job gaps. Career coaches charge $200+/hour. The automated, job-specific skill gap analysis tool is unclaimed.",
    blueprint: [
      "Build a job URL parser that extracts skills, tools, and experience requirements",
      "Build a resume parser that extracts current skills and experience",
      "Run an LLM comparison to identify the exact gap between current state and job requirements",
      "Generate a learning path with specific resources (courses, books, projects) and estimated time",
      "Include a 'fast track' option: what's the minimum viable skill addition to be competitive?",
      "Charge $29/analysis or $99/month for unlimited + job tracking"
    ],
    prompts: [
      "Compare this resume to this job description. Identify: (1) skills I have that match, (2) skills required that I lack, (3) skills mentioned in the job that I have but haven't highlighted. For the gaps, estimate: how long to close each gap, the best free resource, and the best paid resource.",
      "I want to transition from [current role] to [target role]. Based on typical job requirements, generate a 90-day skill acquisition plan. Include: week-by-week learning schedule, specific courses/projects, and a portfolio project I can build to demonstrate each skill.",
      "Review this job posting and identify the 3 skills that will have the highest signal-to-noise ratio in getting me an interview. Ignore nice-to-haves. Focus on what, if I had it, would make a recruiter stop and call me."
    ],
    firstRevenue: "Post on LinkedIn: 'I'll analyze your resume against any job posting for free and tell you exactly what's holding you back.' Collect 100 email addresses. Manually run the first 20 analyses with AI assistance. Charge $29 starting on Day 10.",
    firstTen: "Partner with 3 LinkedIn career coaches. They send SkillGap Oracle to their newsletter. You offer their audience a 50% discount ($14.50/analysis). You split revenue. They get a tool to recommend. You get qualified customers with credit card intent."
  },
  {
    number: "002",
    slug: "permitflow",
    title: "PermitFlow",
    category: "Real Estate",
    tam: "$30B TAM",
    revenueIn: "14 days",
    tagline: "AI reads municipal codes, pre-fills permit applications perfectly, and tells contractors exactly what approvals they need.",
    problem: "Construction permits take 6–18 months and kill projects. The bottleneck isn't the city — it's the application quality. 40% of permit applications are rejected on the first submission due to incomplete documentation, wrong forms, or missing supporting materials. Each rejection adds 4–8 weeks. Contractors and developers lose $500–$5,000 per day on stalled projects.",
    whyNow: [
      "Municipal code digitization accelerated post-COVID — most major cities have parseable online codes",
      "Construction starts are rebounding — contractors are busy and need efficiency tools",
      "AI can now read 500-page zoning codes and extract relevant requirements accurately"
    ],
    tam_detail: "$30B construction permitting market. No AI-native solution exists. Permit consultants charge $200–$500/hour. Tyler Technologies sells permit management to municipalities but nothing for applicants. Clear gap.",
    blueprint: [
      "Index municipal codes for the top 20 cities where permit volumes are highest",
      "Build a project intake form: location, project type, scope, square footage",
      "Use LLM to identify every required permit, approval sequence, and documentation",
      "Pre-fill permit applications using project details and property records (Regrid API)",
      "Generate a checklist of every document needed with sources for each",
      "Charge $299/project analysis + $499 for application pre-fill service"
    ],
    prompts: [
      "You are a municipal permit expert for [City, State]. A contractor wants to [project description] at [address, zoning district]. List every permit required, in the order they must be obtained, with the responsible agency, typical timeline, and fee for each.",
      "Review this permit application for [permit type] in [city]. Identify every field that is incomplete, incorrect, or likely to trigger a rejection. For each issue, provide the correct response and cite the specific code section.",
      "A project at [address] requires an ADU permit in [city]. The property is zoned [zone]. Generate the complete documentation checklist including: forms required (with download links), supporting documents, third-party approvals needed, and common rejection reasons for this project type."
    ],
    firstRevenue: "Cold email 50 small general contractors in one city. Subject: 'Stop getting permits rejected — we pre-fill them for you.' Offer first project free. Charge $299 from Day 2.",
    firstTen: "Join 3 local contractor associations and attend one meeting. Offer to do a free live demo — paste in a project description and show the permit checklist in real time. Close 3 contractors per meeting. Repeat in 4 cities."
  },
  {
    number: "001",
    slug: "griefsupport-ai",
    title: "GriefSupport AI",
    category: "Consumer",
    tam: "$5B TAM",
    revenueIn: "10 days",
    tagline: "Always-on AI grief support between therapy sessions — not a replacement, a bridge.",
    problem: "Grief therapy has a 6-week waitlist. When people finally get a therapist, they see them 1 hour per week. The other 167 hours — the 2am moments, the anniversary triggers, the unexpected grocery store breakdowns — are completely unsupported. Existing mental health apps (Calm, Headspace) are wellness tools, not grief-specific. Grief is a distinct psychological process that requires specific frameworks, not generic mindfulness.",
    whyNow: [
      "Loneliness epidemic + COVID grief backlog created a massive unmet demand",
      "LLMs trained on grief counseling frameworks (Worden, Kübler-Ross) can provide evidence-based support",
      "Mental health destigmatization means more people will use AI support openly"
    ],
    tam_detail: "$5B grief support market growing at 8% CAGR. BetterHelp and Talkspace serve general therapy. Grief-specific AI is completely unclaimed. The 'bridge between sessions' positioning avoids regulator scrutiny while serving real need.",
    blueprint: [
      "Build a fine-tuned prompt system based on Worden's Tasks of Mourning and CGT frameworks",
      "Create a simple onboarding: who did you lose, when, your relationship, current support system",
      "Offer 5 modes: 'I need to talk,' 'Memory sharing,' 'Practical help,' 'Ritual support,' 'Check-in'",
      "Build a 'Share with therapist' report that summarizes sessions for the user's real therapist",
      "Add grief milestone tracking (first holidays, anniversaries) with proactive check-ins",
      "Charge $19.99/month; offer first month free"
    ],
    prompts: [
      "You are a grief support companion trained in Worden's Tasks of Mourning. The user lost [relationship] [timeframe] ago. They are in [task stage]. Respond with warmth and clinical grounding. Do not offer platitudes. Do not minimize. Ask one open question. If they express suicidal ideation, immediately provide crisis resources and stop the session.",
      "A user wants to share a memory of [person they lost]. Create a gentle, structured memory interview: 5 questions that help them articulate what made this person unique, a specific moment they want to preserve, and what they want to remember about how this person made them feel.",
      "Generate a grief check-in for someone approaching the first anniversary of losing [relationship]. Acknowledge the significance of this milestone, normalize the anticipatory grief that often precedes anniversaries, and offer 3 gentle rituals they might consider."
    ],
    firstRevenue: "Post authentically in grief support Facebook groups and r/grief. Don't sell — ask if people would find an AI companion useful between sessions. Collect 200 emails. Offer first month free. Convert at 15% = 30 paying users = $600 MRR in 10 days.",
    firstTen: "Partner with 5 grief therapists. Offer their clients free 3-month access to GriefSupport AI as a 'between sessions tool.' The therapist gets a differentiated offering. You get warm leads who are already in grief support. Ask each therapist for a testimonial."
  }
];

export type Issue = typeof issues[number];
