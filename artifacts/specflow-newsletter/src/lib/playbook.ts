export interface Lesson {
  id: string;
  title: string;
  free: boolean;
  tagline: string;
  content: LessonContent;
}

export interface LessonContent {
  insight: string;
  tactic: string;
  steps: string[];
  warning: string;
  proTip?: string;
}

export const playbookModules = [
  {
    id: "launch",
    title: "Zero to First Dollar",
    tagline: "Sell before you build. Validate before you code.",
    description: "The exact sequence top founders use to go from idea to paying customer in under 72 hours — without writing a single line of production code first.",
    lessons: [
      {
        id: "l1",
        title: "The 48-Hour Phantom Sale",
        free: true,
        tagline: "Build nothing. Charge someone.",
        content: {
          insight: "Every week you build without a paying customer is a bet you're making with your life savings. The Phantom Sale collapses that risk to 48 hours. Create a Stripe payment link. Write one paragraph describing the outcome you deliver. Send it to 50 people who have the problem. If 3 pay — you have a business. If zero pay — you saved 6 months.",
          tactic: "Your DM should describe pain, not product. Wrong: 'I built a tool that tracks X.' Right: 'I know you spend 4 hours/week doing X manually. I found a way to cut that to 20 minutes. Here's a link to join — 10 spots at founding price.' The difference is selling the after, not the during.",
          steps: [
            "Create a Stripe payment link for $49–$199 (use a founding-member price, never free)",
            "Write a single paragraph: the problem, the outcome, the price, the URL",
            "Find 50 people who have this problem right now — LinkedIn, Reddit, Slack communities",
            "Send 50 DMs. Personalize the first line with something specific about them",
            "If 3+ pay within 48 hours: start building. If not: change the problem or the audience, not the price"
          ],
          warning: "Do not offer a free trial. Free signals low value. A founding-member price of $49 tells them you're serious. People who won't pay $49 to solve a painful problem don't actually have a painful problem.",
          proTip: "The response that tells you more than a 'yes': someone who says 'I would pay for this but I need it to also do Y.' That Y is your real product."
        }
      },
      {
        id: "l2",
        title: "Day-1 Retention: The Only Metric That Matters",
        free: true,
        tagline: "If they don't come back tomorrow, they won't come back at all.",
        content: {
          insight: "Every founder obsesses over acquisition. Winners obsess over Day 1 retention. If 100 people sign up and 20 return the next day — that's 20% Day-1 retention. Fix that number before you spend a cent on marketing. The math is simple: a 20% Day-1 retention with zero new signups will eventually hit zero. An 80% Day-1 retention compounds into a real business.",
          tactic: "Run the 3-question diagnostic on your last 20 churned users: (1) Did they know what to do first? (2) Did they feel the value in the first session? (3) Was there a natural reason to return tomorrow? If any answer is 'no,' that's your churn driver — not the product, not the price.",
          steps: [
            "Export your user list sorted by last-active date",
            "Email every user who hasn't returned in 7 days — not a feature announcement, a direct question: 'What stopped you from coming back?'",
            "Compile every reply into a spreadsheet. Find the 3 most common phrases",
            "Fix the top issue. One change only. Measure Day-1 retention before and after",
            "Repeat until Day-1 retention is above 40% — then and only then start paid acquisition"
          ],
          warning: "Do not build new features to fix retention. Retention breaks at onboarding, not at the feature level. The problem is almost always that users don't reach the core value fast enough. Cut steps, don't add them.",
          proTip: "Your best users are not your target market. Stop interviewing them. Interview the user who signed up, used it once, and vanished. Their confusion is your product's biggest revenue opportunity."
        }
      },
      { id: "l3", title: "The Distribution-First GTM Stack", free: false, tagline: "Build your audience before your product exists.", content: { insight: "The biggest mistake in GTM: building a product then finding distribution. The correct order is inverted. Build your distribution channel first — a LinkedIn audience, a newsletter list, a community — then launch the product to that audience. When Codie Sanchez launched Contrarian Thinking, she had 50k newsletter subscribers before she sold a single product. Her first offer sold $500k in 72 hours. Distribution-first is not a strategy; it's the only strategy that works at zero cost.", tactic: "The 90-day distribution rail: Week 1–4: Post 3× per week on LinkedIn about the problem you're solving (not your product). Week 5–8: Launch a free weekly email digest curating the best content in your niche. Week 9–12: Offer your first paid product to your list. Your launch list doesn't need to be 10,000 people — it needs to be 500 people who desperately have the problem. 500 converts at 10% = 50 paying customers on day one.", steps: ["Choose one platform only — LinkedIn for B2B, Twitter/X for tech, YouTube for consumer. Master one before adding a second.", "Post about the problem, not the solution. 'Here are 5 signs your SaaS onboarding is killing your trial conversions' outperforms 'We built a tool to fix onboarding' by 10×.", "Launch a free weekly email within 30 days. Subject line formula: '[Number] things [ICP] need to know about [topic] this week.'", "Gate one piece of genuinely valuable content (a template, a calculator, a checklist) behind an email opt-in. This converts readers to subscribers.", "At 500 subscribers: launch. Send a personal email (not a Mailchimp template) to your entire list explaining what you built and why. Personal emails convert at 3–5×."], warning: "Don't measure follower count. Measure email subscribers. A LinkedIn following of 10,000 with 200 email subscribers is worthless. An email list of 500 engaged readers is a business.", proTip: "The fastest way to grow a newsletter: send a cold DM to 20 people in your target ICP every week saying 'I write a weekly email about [X]. Given what you do, I think you'd find it valuable. Can I add you?' 80% say yes. That's 800 subscribers in 10 weeks with zero ad spend." } },
      { id: "l4", title: "The Network Capture: Turning Users Into a Sales Force", free: false, tagline: "Your first 100 customers should close your next 1,000.", content: { insight: "The most underused growth lever in any SaaS: your existing customers. At $10k MRR, your users are collectively connected to 50,000+ potential customers. None of them are sending referrals because you never built the system for it. The Network Capture turns passive users into active referral engines — not through incentives, but through identity. People refer products they're proud to be associated with.", tactic: "The referral trigger that works: email every active user at Day 30 (not Day 1, not Day 7 — Day 30, when they've experienced enough value to have a genuine opinion) with this subject: 'A quick favor?' Body: 'You've been using [product] for a month. I'm curious — who else do you know who deals with [problem]? I'd love an intro.' The word 'intro' converts 3× better than 'referral.' Intros feel like networking. Referrals feel like selling.", steps: ["Build a one-sentence value statement your users can repeat verbatim: '[Product] does [specific outcome] for [specific ICP] in [specific timeframe].'", "Email your Day 30 cohort with the intro ask — personalized with their name and what they've accomplished inside your product.", "Create a referral landing page that speaks TO the referred person: 'Your colleague [Name] thought you'd find this valuable because you deal with [X].'", "Close the loop: when a referral converts, email the referrer personally within 24 hours. People refer more when they know it worked.", "Build a 'customer advisory board' of your top 5 referrers — they get early feature access and direct founder access. They become your most vocal advocates."], warning: "Don't launch a generic affiliate program. Affiliate programs attract mercenaries who spam your link. The Network Capture is about activating genuine advocates — people who refer because they're proud to, not because they're paid to.", proTip: "The highest-converting referral channel is never the one you build — it's the one that happens organically. Find where your product is already being mentioned (Slack communities, Reddit threads, LinkedIn comments) and show up in those conversations. Organic referral amplification costs nothing and converts at 4× paid." } },
    ]
  },
  {
    id: "sales",
    title: "Closing Without Selling",
    tagline: "The best close is a customer who sells themselves.",
    description: "Counterintuitive sales systems that let the product, the proof, and the framing do the selling — so you're never in a pitch, you're in a conversation.",
    lessons: [
      {
        id: "s1",
        title: "The Founding-Member Close",
        free: true,
        tagline: "Make them feel like co-founders. They'll sell for you.",
        content: {
          insight: "Your first 10 customers are not customers — they're co-founders without equity. Treat them that way and they become your most powerful sales asset. The founding-member close works because it transforms a transaction into an identity. They're not buying software; they're joining a mission they'll tell everyone about.",
          tactic: "The script that closes: 'I'm not selling you a subscription. I'm giving 10 people early access to the thing that will [specific outcome] by [specific date]. In exchange, I need 2 hours of your time per month for feedback and one honest testimonial. I need people who get it before the world does. Are you in?' — 80% say yes. The other 20% aren't your customer anyway.",
          steps: [
            "Identify 20 people who've complained about the exact problem you solve — in your DMs, in communities, to mutual contacts",
            "Offer them founding membership: 50% lifetime discount + direct access to you",
            "In exchange: monthly 30-min call + written testimonial after 60 days of use",
            "Document every insight from those calls. This IS your product roadmap",
            "At 10 founding members with testimonials: open standard pricing. Those 10 testimonials do the closing for you"
          ],
          warning: "Never give founding membership away free. Even $1 creates skin in the game. Free users don't show up to calls. Free users don't write testimonials. Free users are not founding members — they're spectators.",
          proTip: "Ask your founding members: 'Who else do you know who has this problem?' — you will get 3-5 warm referrals from each one. That's 30-50 warm leads from 10 customers. Your next sales pipeline, built for $0."
        }
      },
      {
        id: "s2",
        title: "LTV Is the Only Number: The Churn-Kill Matrix",
        free: true,
        tagline: "A 5% churn reduction doubles your company value. Full stop.",
        content: {
          insight: "LTV = (Monthly Revenue × 12) ÷ Annual Churn Rate. At 50% annual churn, your LTV is 2× MRR. At 10% churn, it's 10× MRR. The math is violent. A business doing $10k MRR with 5% monthly churn is worth $200k. The same revenue with 0.5% monthly churn is worth $2M. Same top line. 10× different company.",
          tactic: "The 3 churn triggers nobody tracks: (1) First-week silence — user signs up, never contacts support, never asks a question. Will churn within 30 days. (2) Feature request denied twice — they asked for something, you said no or nothing, they leave. (3) No workflow integration — your tool isn't in their daily flow. Map all three. Fix them in order.",
          steps: [
            "Pull your churn data for the last 90 days. Find the average 'days to cancel' — most businesses have a pattern (often Day 7 or Day 30)",
            "Interview your last 10 churned users. Ask only: 'What was happening in your work the week you cancelled?'",
            "Map every churn reason to one of the 3 categories above",
            "For 'first-week silence': trigger a personal check-in email on Day 3 from the founder's inbox (not a template)",
            "Reduce churn by 2% monthly before touching acquisition. 2% monthly churn reduction = 3× LTV increase in 12 months"
          ],
          warning: "Do not offer discounts to prevent churn. Discounting trains users to cancel and wait for the discount. Retention is a product problem, not a pricing problem.",
          proTip: "Your highest-LTV customers have one thing in common. Find it. That's your real ICP. Every future sales, product, and marketing decision should optimize for acquiring more of them — not the average user."
        }
      },
      { id: "s3", title: "The $100k Enterprise Close: Script + Psychology", free: false, tagline: "How to close six-figure deals without a sales team.", content: { insight: "Enterprise deals don't close on product merit. They close on three things: (1) the buyer's personal credibility inside their org (buying you is a bet they're making with their career), (2) risk reduction (a $100k decision requires proof that it won't fail publicly), and (3) internal champion momentum (someone inside the org has to sell for you when you're not in the room). Miss any of these and the deal stalls regardless of how good your product is.", tactic: "The enterprise close script: Discovery call opening: 'Before I show you anything about our product, I want to understand your situation. What's the specific outcome you need to achieve in the next 90 days, and what's blocking you right now?' — Let them talk for 20 minutes. Then: 'Based on what you've described, we've helped [two similar companies] achieve [specific outcome] in [timeframe]. Would it be useful to show you exactly how?' This framing positions your demo as a solution to their stated problem, not a product pitch.", steps: ["Map the org: before your first call, identify the economic buyer (who approves), the champion (who wants it), and the blocker (legal, IT, or a competing vendor). Your champion needs a brief to handle the blocker internally.", "Send a pre-call brief: 'To make our 45 minutes as valuable as possible, I've prepared a one-page overview of how we've solved [problem] for [similar company]. Attached. Looking forward to building on this in our call.'", "Close the discovery: 'If we can solve [stated problem] in [timeframe], is there anything on your side that would prevent us from moving forward?' Surface blockers early.", "Proposal format: 1-page only. Problem → Solution → Proof (2 case studies) → Investment → Next step. No 20-slide deck.", "Follow-up cadence: Day 1 after proposal: 'Any questions on the brief?' Day 5: 'Happy to connect you with [customer reference] who was in a similar situation.' Day 10: 'I want to be respectful of your timeline — is this still a priority for Q[X]?'"], warning: "Never discount to close enterprise. Discounting signals desperation and destroys your credibility with the economic buyer. If price is the objection, the real objection is risk. Address risk with proof — case studies, references, pilot programs — not with margin.", proTip: "The best enterprise sales tool you have is a customer reference call. Keep a list of 3 customers who've agreed to be references and who are genuinely enthusiastic. One 15-minute reference call closes more enterprise deals than any deck or demo you'll ever build." } },
      { id: "s4", title: "Institutional Closing: Getting VCs to Chase You", free: false, tagline: "Stop pitching. Start making them FOMO.", content: { insight: "VCs see 3,000 pitches per year and invest in 10. The founders who get funded are not the best pitchers — they're the ones who've made the VC feel like they're being let into something rather than being sold something. The shift: stop asking for meetings. Start building a reputation that makes the meetings inbound.", tactic: "The inbound VC strategy: Publish your metrics monthly (if you can). Tweet your learnings weekly. Build a founder brand in your specific niche that makes you the most credible voice in that space. When a VC sees your Series A announcement, they should already know who you are from your content. The best pitch is the one where the VC opens with 'I've been following your work for 6 months.' At that point, you've already closed.", steps: ["Build your 'narrative before numbers': VCs invest in stories that are inevitable. Your narrative: why is this market changing NOW, why are you uniquely positioned to win it, why would this be a $1B company in 7 years. Write this 1-page narrative before you build your deck.", "The warm intro chain: map every VC you want to pitch. Find 2nd-degree connections on LinkedIn. Ask for intros 6 months before you need the money — 'Not raising yet, just building relationships.'", "The FOMO play: create artificial urgency by building multiple relationships simultaneously. 'We've had 3 term sheets come in this week' is the most powerful sentence in fundraising.", "Data room readiness: before your first VC call, have ready: 24 months of MRR data, unit economics (CAC, LTV, payback period), cohort retention table, competitive landscape, team bios. VCs who request these and receive them within 24 hours close 3× faster.", "The close line: 'We're closing this round in 30 days. We have [X] committed. Is this something you want to be part of?' — Deadline + social proof + direct ask."], warning: "Never raise when you're desperate. VCs can smell it and they use it to negotiate terms. Raise when you have 12 months of runway left and your metrics are on an upward curve. The best fundraising position is one where you don't need the money.", proTip: "The most underused fundraising tool: angels from your industry who've made money. A $50k angel check from a credible operator in your space is worth more than a $500k VC check in terms of signal. It tells institutional investors that people who actually know the market are betting on you." } },
    ]
  },
  {
    id: "scale",
    title: "Systems Over Heroics",
    tagline: "If the business needs you to run, it doesn't run.",
    description: "Replace yourself before you burn out. The operational playbooks that let you build a $1M+ business with a team of three and none of the chaos.",
    lessons: [
      {
        id: "sc1",
        title: "The $0 Ops Stack That Replaced a $80k/yr Sales Team",
        free: true,
        tagline: "Automate your revenue engine before you hire anyone.",
        content: {
          insight: "Most founders hire before they systematize. The result: expensive people doing expensive manual work. The right order is: systematize first, then hire to manage the system — not to do the work. This stack processes 200+ leads per week with zero human intervention until it's time to close.",
          tactic: "The content-to-customer rail: LinkedIn post (problem-framing) → Personal newsletter thread (depth + credibility) → Automated DM sequence (3 messages over 7 days) → Calendly booking link → Demo → Close. Average cycle: 18 days. Average CAC: $0 in ad spend. Runs 24/7.",
          steps: [
            "Set up: Notion (CRM) + Make.com (automation) + Instantly.ai (email sequences) + Calendly (booking). Total cost: $47/month",
            "Write 3 DM templates: Day 0 (problem empathy), Day 4 (social proof + case study), Day 7 (direct ask with Calendly link)",
            "Connect LinkedIn comments on your posts to trigger the Day 0 DM automatically via Make.com webhook",
            "Every booked call auto-populates your Notion CRM with their LinkedIn, company, and notes",
            "Rule: If you've done any task manually more than 3 times, build a Make.com scenario for it before doing it a 4th time"
          ],
          warning: "Don't automate your close. The last step — the actual human conversation — is where relationships and trust are built. Automate everything before it. Never automate the close itself.",
          proTip: "Your competitors are not automating their outreach because it 'feels impersonal.' That's your arbitrage. Personal automation (messages that reference their specific work) outperforms mass email blasts 8× in reply rate."
        }
      },
      {
        id: "sc2",
        title: "Hiring Without Cash: The Revenue-Share Engineer",
        free: true,
        tagline: "Get world-class builders before you can afford them.",
        content: {
          insight: "The best early engineers don't want salary — they want upside and interesting problems. Revenue-share hiring gives both without burning your runway. Here's how: engineer builds Feature X, you give them 2% of the incremental revenue Feature X generates for 18 months. They ship faster than a salaried employee because their paycheck depends on it.",
          tactic: "The equity mistake kills companies: giving equity too early, to too many, with no cliff. Standard that works: 0.5%–2% for early engineers, 4-year vest, 1-year cliff, standard ESOP pool of 10%. Never give equity for 'advising.' Advisors get paid in cash or not at all. Equity is for builders.",
          steps: [
            "The interview that tells you everything: Don't give them problems. Give them your GitHub repo and say 'Find something broken or missing. Open a PR.' Their first PR reveals how they think, how they communicate, and whether they're a builder or a talker",
            "Revenue-share structure: define the feature, agree on the measurement metric (new MRR attributable to that feature), agree on the % and time window",
            "Document everything in a simple 1-page agreement before they write a line of code",
            "For your first full-time hire: they should already be working with you on revenue-share. Full-time is a promotion, not an experiment",
            "Cliff rule: if they don't last 12 months, you owe nothing on unvested equity. Hold the cliff firm — always."
          ],
          warning: "Never hire a generalist first. Your first 3 hires should all be specialists: one who can ship product, one who can close deals, one who can keep the books. Generalists are for large teams. Small teams need people who are exceptional at one thing.",
          proTip: "The best referral network for engineering talent is your own code. Open-source one non-core component of your product. The engineers who submit quality PRs to your open-source repo are pre-vetted candidates who already understand your codebase."
        }
      },
      { id: "sc3", title: "Secondary Market Liquidity: Taking Chips Off Before Exit", free: false, tagline: "Sell equity before the company sells.", content: { insight: "Secondary transactions — selling your existing shares to a new investor before a company exit — are available to founders as early as Series A. Most founders don't know this option exists. You can sell 10–20% of your personal position, take real cash off the table, and keep building with a clearer head. The psychological impact is enormous: a founder who has already taken $500k in secondary proceeds makes better long-term decisions than one who is completely illiquid and desperate for an exit.", tactic: "The secondary negotiation: when you raise your Series B, negotiate a personal secondary sale as part of the round. Frame it as alignment, not desperation: 'I want to be fully focused on the next 5 years. Taking some chips off the table lets me do that without personal financial pressure.' Most lead investors will agree to $250k–$1M in secondary if the round is otherwise structured cleanly.", steps: ["Platforms for secondary transactions: Forge Global, Nasdaq Private Market, Caplight. For early-stage: direct secondary with your existing investors or new strategic angels.", "The negotiation lever: a secondary sale sets a market price for your equity. Use this as a reference point in future primary rounds.", "QSBS eligibility check: C-corp structure, under $50M in gross assets at issuance, held 5+ years. Talk to a startup tax attorney ($500 for one session that could save you $2M+ at exit).", "Earnout negotiation if acquired: push for metrics you control, not metrics that depend on the acquirer's integration decisions. Standard earnout structures favor the acquirer — negotiate the triggers carefully.", "Rule: never sell more than 20% of your position in secondary before exit. You need enough skin in the game to stay motivated."], warning: "Secondary transactions require board approval and right-of-first-refusal from existing investors. Review your shareholder agreement before initiating any conversation. Surprising your board with a secondary is a trust-killer.", proTip: "The best time to do a secondary is when you have competing term sheets for a primary round. Leverage creates leverage. When two funds want to lead your Series B, you have the power to include secondary terms in the deal." } },
      { id: "sc4", title: "The Venture OS: Running a $5M ARR Business Like a Machine", free: false, tagline: "The exact org chart, meeting cadence, and decision framework.", content: { insight: "At $5M ARR, the biggest risk is not competition — it's internal entropy. Decisions slow down. Communication breaks. The founder starts firefighting instead of building. The Venture OS is the set of systems that prevent this: a meeting architecture, a decision framework, and an org design that lets a small team operate with the speed and clarity of a 10-person startup.", tactic: "The weekly cadence that works: Monday — 30-min leadership standup (3 questions: what's the one number we're tracking this week, what's the one blocker, what decision needs to be made today). Wednesday — product review (show what shipped, show the metrics, cut anything not moving the needle). Friday — customer pulse (3 customer calls, internal debrief on patterns).", steps: ["Write a one-page 'Operating Manual' for your company: your values (3 max), your decision-making framework (who decides what), and your communication norms (what goes in Slack, what goes in email, what gets a meeting).", "Implement a weekly metrics dashboard that every team member can see: MRR, churn, CAC, NPS, pipeline. Visibility creates alignment without meetings.", "The decision log: every significant decision (>$5k, >1 week of eng time) gets documented in Notion with: the decision, the rationale, the expected outcome, and the review date. You review every decision 90 days later. This is how you learn from yourself.", "Org design principle: never hire a layer of management between you and the customer. Every person in a leadership role should be customer-facing at least 20% of their time.", "The quarterly offsite: 2 days, no laptops, one question: what's the one thing that, if we did it in the next 90 days, would make everything else easier or irrelevant?"], warning: "The Venture OS fails if leadership doesn't model it. If you skip the weekly standup, your team skips it. If you don't use the decision log, your team won't either. Systems require discipline from the top down.", proTip: "The best indicator that your Venture OS is working: you can take a 2-week vacation and the company runs without you. If it can't, you have a system problem, not a team problem." } },
    ]
  },
  {
    id: "brand",
    title: "Authority That Converts",
    tagline: "Your personal brand is your cheapest sales channel.",
    description: "How to build a founder brand that generates inbound leads, closes enterprise deals, and attracts top talent — without being a content machine or an influencer.",
    lessons: [
      {
        id: "b1",
        title: "The Contrarian Anchor: Own the Counter-Narrative",
        free: true,
        tagline: "Find what everyone believes that is wrong. Destroy it publicly.",
        content: {
          insight: "The fastest way to build authority in any space is to pick the most widely-held belief in that space and publicly prove it wrong with data. This is called the Contrarian Anchor. It works because it creates a specific, searchable position. You're not 'a startup founder' — you're 'the person who proved waitlists kill startups.' That's memorable. That's what people quote.",
          tactic: "Example: Every startup newsletter says 'build a waitlist to validate demand.' The contrarian position: 'Waitlists destroy startups — here's why.' Write 1,000 words with data (conversion rates from waitlist to paid are typically under 3%). Post it. Tag the biggest waitlist advocates. The debate in the comments IS the distribution. You get 10× more reach from the fight than from the article.",
          steps: [
            "List the top 5 most common advice in your space (e.g., 'always start with a landing page', 'build in public', 'launch on Product Hunt')",
            "Pick the one you have direct experience disproving or complicating",
            "Write 800–1,200 words: here's the conventional wisdom, here's why it's wrong or incomplete, here's what I did instead, here are the numbers",
            "Post on LinkedIn with the opening line that names the belief: 'Everyone says [X]. I tried it and here's what actually happened.'",
            "Engage every comment for 4 hours post-publication — algorithm rewards it, and the conversations are where you meet your next customers"
          ],
          warning: "Don't be contrarian about things you haven't personally done. Contrarian positions that come from lived experience are authority. Contrarian positions that come from opinion are noise. You need the receipts.",
          proTip: "Save every heated comment thread from your contrarian posts. Those are free market research — people are revealing their real problems and beliefs. Your next 3 content pieces are in those threads."
        }
      },
      {
        id: "b2",
        title: "The 3-Post Authority Loop (30-Day Brand Sprint)",
        free: true,
        tagline: "One month. One system. Inbound leads for life.",
        content: {
          insight: "Your personal brand should not be about you. It should be about the transformation you deliver. Nobody follows 'a startup founder.' They follow the person who helped 3 B2B SaaS founders go from $0 to $10k MRR in 60 days using one specific channel. Specificity is the authority. Vagueness is the noise.",
          tactic: "The 3-post formula that builds compounding authority: Post 1 — The Mistake (a specific failure you made, with numbers and what you learned). Post 2 — The Process (the exact step-by-step of something specific you do that works). Post 3 — The Result (proof it worked, with screenshots or metrics). Repeat every week for 30 days. By Day 30 you have 12 posts, a documented system, and an audience that trusts you.",
          steps: [
            "Week 1, Post 1 (Mistake): 'I wasted $12,000 on paid ads before doing this one thing first. Here's what I wish I knew.'",
            "Week 1, Post 2 (Process): 'The exact 5-step sequence I use to close enterprise clients without a sales team.'",
            "Week 1, Post 3 (Result): 'From $0 to $18k MRR in 67 days. Here are the 3 decisions that made the difference.'",
            "Cross-post your best performing LinkedIn post as a Twitter/X thread every week",
            "At Day 30: compile your best insights into a free PDF. Use it as a lead magnet — email in exchange for the guide. This is your list-building machine."
          ],
          warning: "Do not post about your product. Post about problems, lessons, and results. People follow people who teach them something, not people who sell them something. Selling comes later, in DMs, after trust is built.",
          proTip: "Every post should have one specific number in it — revenue, time, percentage, count. 'I grew fast' is invisible. 'I went from $2k to $14k MRR in 44 days' stops the scroll. Numbers are credibility. Specifics are trust."
        }
      },
      { id: "b3", title: "From Followers to Term Sheets: The Capital Inbound System", free: false, tagline: "Make investors find you. Not the other way around.", content: { insight: "The founder brand is the most undervalued fundraising asset in early-stage investing. In 2024, 67% of Andreessen Horowitz deals were inbound — the founders came to them through reputation, not cold outreach. Building a founder brand that generates investor inbound is not about vanity metrics. It's about positioning yourself as the most credible operator in a specific space, so that when a VC thesis lands on your category, your name is already on their list.", tactic: "The content-to-capital loop: Write about your market weekly (not your product). Quantify your learnings with real data. Tag relevant investors in threads where you challenge common narratives in your space. When an investor engages with your content, their algorithm starts showing them your posts. After 60 days of consistent posting, you are 'someone they've been following' — and that's the most powerful first-meeting frame in fundraising.", steps: ["Identify 20 VCs who invest in your stage and sector. Follow them on Twitter/X and LinkedIn. Read their essays and thesis posts.", "Write one LinkedIn post per week that directly challenges a common belief held in your space. Tag 2–3 of your target VCs when the content is relevant to their stated thesis.", "Build a 'fundraising signal' by sharing company milestones publicly: 'Hit $50k MRR this month. Here's what worked and what surprised us.' Investors track founders who share metrics.", "When an investor engages with your content (like, comment, share), send a DM within 24 hours: 'Thanks for engaging with the post. I've been following your thesis on [X] — would love to get your perspective on how we're approaching [specific aspect of your market]. Not looking for anything, just value your view.'", "The close: after 3–4 touchpoints, 'We're beginning to talk to a small number of investors about our Seed/Series A. Given your focus on [space], I think there's a real fit. Would 20 minutes make sense?'"], warning: "Don't ask for money in a first investor interaction. Ever. The goal of the first conversation is to make them want a second conversation. Asking for investment before building rapport is the fastest way to get permanently ignored.", proTip: "The best investor content is not 'we hit a milestone.' It's 'here's what we learned about our market that surprised us.' Learning content demonstrates that you're the kind of founder who iterates on data — which is exactly what early-stage investors are betting on." } },
      { id: "b4", title: "Exit Branding: Position Yourself for the Acquisition Conversation", free: false, tagline: "The acquirer Googled you before the call. What did they find?", content: { insight: "Acquisitions are almost always relationship-driven, not process-driven. The acquirer who pays 8× revenue is almost always someone who has been watching you for 18+ months. Exit branding is the practice of systematically building the relationships and reputation that make your company an obvious acquisition target — before you ever run a formal process.", tactic: "The acquisition positioning framework: Be publicly known as the category leader in a specific, small niche. 'The best tool for DevOps teams at Series A startups' is worth more to an acquirer than 'the best DevOps tool' because the specificity signals you have a defensible, loyal customer base — the thing acquirers actually pay for.", steps: ["Map your 5 most likely acquirers today — not theoretical ones, specific companies with named corporate development contacts. Find them on LinkedIn.", "Build a relationship with their corp dev team 24 months before you want to sell. Not to sell — to share insights, compare market maps, and position yourself as a thought leader they can learn from.", "Publish a quarterly 'State of [Your Market]' report. Acquirers read these. It positions you as the most informed operator in your space.", "The pre-LOI signal: when an acquirer starts asking specific product and customer questions (not general market questions), they are running diligence. Engage deeply and offer to set up reference calls with customers.", "Hire a banker for the formal process, but only after you have 2+ interested parties. A banker's leverage is in creating competition. If you only have one interested party, you have a negotiation, not an auction."], warning: "Never sell to the first acquirer who expresses interest. One interested party gives you no leverage. Wait until you have at least two serious parties in conversation simultaneously before engaging formally. The difference in price between a one-party and two-party process is typically 30–50%.", proTip: "The most powerful exit branding move: publicly turn down acquisition interest. 'We had a few acquisition conversations this year and declined — we think the opportunity is still much larger.' This signals that you've been validated as acquirable AND that you have conviction in the upside. Investors and future acquirers treat you differently after this." } },
    ]
  },
  {
    id: "intel",
    title: "Signal Before Noise",
    tagline: "Find the opportunity 12 months before the market does.",
    description: "The intelligence systems top founders use to identify $100M+ opportunities hiding in plain sight — regulatory shifts, tech unlocks, and demographic gaps that haven't been named yet.",
    lessons: [
      {
        id: "i1",
        title: "The Regulatory Arbitrage Playbook",
        free: true,
        tagline: "Every major regulation creates a $100M market overnight.",
        content: {
          insight: "The most reliable source of venture-scale opportunities is government regulation. Every major regulation creates three things simultaneously: a compliance cost (your market), a set of incumbents who move slowly (your competitive gap), and a cohort of SMBs who can't afford the incumbent solutions (your customer base). GDPR created the consent management market — OneTrust went from $0 to $5.1B in 4 years. AI regulation is creating 15 new categories right now.",
          tactic: "Where to read before the market does: EU Parliament committee notes (europarl.europa.eu — free), FDA pre-market guidance documents, SEC no-action letters, FTC consent decrees. These drop 6–18 months before any major media coverage. The gap between regulatory signal and market reaction is your entry window.",
          steps: [
            "Set up a Google Alert for: '[your industry] + regulation + compliance + 2025/2026'",
            "Read the EU AI Act compliance timeline — there are 14 categories with mandatory compliance dates between now and 2027. Each one is a market",
            "Find 3 regulations in your space that take effect in the next 18 months",
            "For each: who is affected? What do they need to comply? Who is currently selling them that solution? Is there an SMB-tier gap?",
            "The pattern: Regulation comes → Incumbents build for enterprise → Nobody builds the $99/month compliance tool for SMBs → You do → Revenue in 90 days"
          ],
          warning: "Don't build a compliance tool if you don't understand the regulation deeply. Read the actual legislation, not the summaries. Hire a regulatory consultant for one 2-hour session ($500). That conversation is worth $500k in product direction.",
          proTip: "The best regulatory arbitrage opportunities are in cross-border compliance — where a US regulation applies to EU companies or vice versa. Nobody builds those products because the market feels small. The market is never small when compliance is mandatory."
        }
      },
      {
        id: "i2",
        title: "The Intelligence System: Reading Markets Before They Move",
        free: true,
        tagline: "Your competitors' job listings tell you what they're building 6 months before launch.",
        content: {
          insight: "Job listings are the most under-used competitive intelligence source available. When a company posts 3 new ML engineer roles and starts hiring for 'LLM integration,' they're announcing their product roadmap 6 months early. You have a window to build what they're building — smaller, faster, cheaper — and own the market before they arrive.",
          tactic: "The intelligence stack: (1) Google Alerts for '[competitor] + jobs' and '[competitor] + hiring.' (2) LinkedIn job search filtered to your competitors. (3) Builtwith.com to track when competitors add new tech to their stack. (4) G2/Capterra reviews sorted by 'most recent' — users complain about what's broken RIGHT NOW. That's your feature roadmap.",
          steps: [
            "Set up monitoring for your top 5 competitors on LinkedIn Jobs — new postings email you daily",
            "When a competitor raises Series A: they're about to abandon SMB customers for enterprise. That's your market window. Move in immediately",
            "Weekly ritual: Read 20 most recent G2 reviews of the #1 player in your space. Highlight every complaint. That's your differentiation brief",
            "Use Perplexity AI query: 'What are the top 10 complaints about [competitor] in the last 6 months? Include Reddit, G2, Twitter.' Run this monthly",
            "Track: when the hype cycle around a space peaks (VC articles, TechCrunch coverage), real businesses are 18 months away from emerging. Enter after the hype, before the revenue."
          ],
          warning: "Intelligence without action is entertainment. Set a rule: every weekly intelligence review must result in one product decision, one content piece, or one sales action. Information you don't act on in 7 days is worthless.",
          proTip: "The biggest opportunity is in the space that VCs stopped funding 12–18 months ago. After hype dies, serious operators are left. They have revenue, they have customers, and they're underserved by vendors who chased the next shiny thing. That's your market."
        }
      },
      { id: "i3", title: "The Market Gap Matrix: Finding White Space Before It Gets Named", free: false, tagline: "The $0 research method that found 6 venture-scale gaps last quarter.", content: { insight: "The best startup opportunities are in markets that don't have a name yet. By the time a market is named — 'the AI agent space', 'the no-code movement' — it's crowded. The Market Gap Matrix is a systematic process for finding white space before it's categorized: you're looking for a specific intersection of (1) a behavior people are already doing manually, (2) a technology that just became capable enough to automate it, and (3) a regulatory or demographic shift that makes this urgent now.", tactic: "The Gap Matrix scan: every Friday, spend 30 minutes running these 4 queries on Perplexity: (1) 'What manual workflows do [ICP] still do in spreadsheets in 2025?' (2) 'What software categories are getting VC funding that didn't exist 3 years ago?' (3) 'What regulations are going live in the next 18 months that require compliance software?' (4) 'What are the top complaints about [market leader] in G2 reviews this quarter?' The intersection of these queries reveals white space.", steps: ["Build a 'gap registry' in Notion: every white space you identify gets an entry with: the manual workflow, the tech that now enables automation, the target ICP, and the estimated market size.", "Validate with a simple test: post on LinkedIn — 'Do you still do [workflow] manually? I'm researching this space.' Count the 'yes' replies. 50+ = real problem. Under 10 = wrong ICP.", "Check for venture activity: search Crunchbase for funding in adjacent categories. Zero funding = no market OR huge opportunity. Some funding = validation. Heavy funding = crowded.", "Map the cost of the manual workflow: 'X hours/week × $Y/hour × Z companies in the ICP = total addressable cost.' This becomes your TAM narrative.", "The 48-hour decision: after mapping a gap, run a Phantom Sale within 48 hours. Don't research more. Test with a Stripe link. Reality beats theory every time."], warning: "The most seductive market gaps are the ones that require 3+ years to build. The best gaps are the ones where you can deliver 80% of the value with a 12-week build. Don't let a real market gap lead you into an 18-month product cycle.", proTip: "The best market gaps are the ones that incumbent players actively ignore because the market is 'too small' for them. A $50M market that a $2B company ignores is a perfect target for a lean startup. You can build a profitable $5M ARR business in that gap before they notice you exist." } },
      { id: "i4", title: "Strategic Counter-Play: Building Against 2026's Biggest Shifts", free: false, tagline: "The specific sectors we're watching — and why.", content: { insight: "2026 will be defined by 5 structural shifts that are creating venture-scale opportunities RIGHT NOW: (1) AI regulation compliance — every company will need documented AI governance by 2026-Q3 in the EU; (2) the post-remote work infrastructure gap — companies now have 3-4 different work models with zero coordinating software; (3) health data portability — new interoperability mandates are forcing hospitals to share patient data, creating a middleware opportunity; (4) SMB financial automation — 65% of SMBs still use manual processes for AP/AR; (5) the creator economy B2B pivot — creators are becoming businesses and have zero back-office infrastructure.", tactic: "Counter-play framework: don't build for the trend. Build for the company that the trend creates. AI is a trend. The compliance department that AI creates is your market. Remote work is a trend. The async collaboration software for hybrid teams is your market. Identify the operational need that the trend forces on companies, then build the tool that meets it.", steps: ["Pick one of the 5 shifts above that intersects with your existing domain knowledge. Knowledge is your unfair advantage.", "Map the 3 most painful new workflows the shift creates for your target ICP. Interview 10 people in that ICP this week.", "Identify which existing players are NOT serving this new need (hint: they're too busy serving the old need).", "Build the smallest possible version of the solution in 4 weeks. Use AI to compress build time. Ship to the 10 interview subjects first.", "Price at the value of the shift, not the cost of the tool. A compliance tool that saves $200k in regulatory fines should be priced at $500/month, not $50/month."], warning: "Structural shifts create crowded markets fast. The window between 'nobody has built this yet' and 'there are 50 competitors' is typically 18–24 months. Your goal is to become the category leader before the window closes, not to be first by a year.", proTip: "The best counter-play strategy: become the most informed commentator on the shift itself. If you publish the best analysis of the EU AI Act's impact on SaaS companies, you will become the first call for every company that needs a compliance solution. Content creates inbound. Inbound creates sales." } },
    ]
  },
  {
    id: "ai",
    title: "AI as Unfair Advantage",
    tagline: "Three people with the right AI stack can outship a team of thirty.",
    description: "The specific workflows, prompts, and tool combinations that let a solo founder move at startup-team speed — without burning out or hiring prematurely.",
    lessons: [
      {
        id: "ai1",
        title: "The 10× Build Stack: v0 → Cursor → Vercel in 90 Minutes",
        free: true,
        tagline: "From idea to live product before lunch.",
        content: {
          insight: "The 2024/2025 AI stack has created the first era where a non-technical founder can ship production software in a single day. Not a prototype — a live, deployed, paying-customer-ready product. The tools exist. The gap is knowing the exact workflow. Here it is.",
          tactic: "The prompt that ships: 'I am building [product name] for [specific ICP]. They have this problem: [1 sentence]. Build me a [specific component/page] that [specific job it does]. Existing types: [paste your types]. Constraints: mobile-first, no external APIs, match this color scheme: [hex]. Output only the component — no explanation.' The specificity eliminates 80% of back-and-forth.",
          steps: [
            "v0.dev: generate your UI. Prompt: describe the exact user action and the component that enables it. Download the code.",
            "Cursor: open the project. Write your tests FIRST (with Claude). Then: 'Make the code pass these tests.' LLMs make 60% fewer errors when they know the success criteria upfront.",
            "Supabase: set up your DB in 10 minutes using the SQL editor with this prompt: 'Create a schema for [your product]. Tables: [list]. Relationships: [describe]. Include RLS policies for authenticated users.'",
            "Vercel: connect GitHub repo. Set environment variables. Deploy in 3 minutes.",
            "Total monthly cost of this stack: Cursor $20 + Vercel $0 (hobby) + Supabase $0 (free tier) + v0 $20 = $40/month. This is your team."
          ],
          warning: "AI-generated code accumulates technical debt fast. Set a weekly rule: one session dedicated to refactoring and cleaning AI output. Never ship AI code you don't understand. If you can't explain what it does in one sentence, you can't debug it when it breaks at 2am.",
          proTip: "The loop that cuts build time by 70%: Write failing tests → Cursor writes code to pass them → AI reviews the code → you review the AI review. Four layers of validation. Four times better output."
        }
      },
      {
        id: "ai2",
        title: "Perplexity as a Revenue Engine: Market Intelligence Prompts That Print Money",
        free: true,
        tagline: "The exact queries that found 3 six-figure product opportunities last quarter.",
        content: {
          insight: "Perplexity is not a search engine. It's a real-time synthesis machine. Used correctly, it replaces a $5,000/month market research retainer. The difference between founders who use it as Google-with-better-answers and founders who use it as a strategic weapon is the quality of the query.",
          tactic: "The research loop that works: Perplexity for market signal → Claude for synthesis and pattern recognition → Notion for pattern tracking → Linear for roadmap → Ship in 2 weeks. Each stage adds a layer of intelligence that raw search cannot provide.",
          steps: [
            "Competitive intelligence query: 'What are the 10 most common complaints about [competitor] in the last 6 months? Show specific Reddit threads, G2 reviews, and Twitter discussions. Include exact quotes where possible.'",
            "Opportunity discovery query: 'What manual workflows do [ICP — e.g., real estate agents] still do in spreadsheets or email in 2025 that software hasn't solved well? Give specific examples with community discussions.'",
            "Market timing query: 'What software categories are getting VC funding in [your space] in Q1-Q2 2025? What's the thesis behind these investments? What problem are they all trying to solve?'",
            "Customer language query: 'How do [ICP] describe [their problem] in their own words on Reddit and LinkedIn? What words and phrases do they use? What do they call this problem?'",
            "Run queries weekly. Document every insight. After 4 weeks you have a market intelligence brief worth more than any consultant will sell you for $10k."
          ],
          warning: "Perplexity hallucinates on specific statistics and company financials. Use it for directional signal, not precise data. Verify any specific number it gives you before putting it in a deck or a sales call.",
          proTip: "The highest-ROI query: 'What are software buyers in [your industry] being asked by their bosses to solve that doesn't have a good solution yet?' The responses are leads. Each one is a buyer with a problem and budget, looking for exactly what you're building."
        }
      },
      { id: "ai3", title: "The Private LLM Stack: Building AI Features That Are Your Moat", free: false, tagline: "Why your AI layer should be proprietary — and how to build it.", content: { insight: "Every SaaS product built on a generic LLM API (GPT-4, Claude, Gemini) has zero AI moat. Your competitor can replicate your AI feature in 2 weeks by calling the same API. The moat is built in the layer between the LLM and your users: your proprietary data, your fine-tuned models, your evaluation frameworks, and your retrieval architecture. This lesson is about building that layer.", tactic: "The private AI stack that creates defensibility: (1) Collect and structure proprietary data from day one — every user interaction is a training signal. (2) Use RAG (Retrieval-Augmented Generation) to ground LLM outputs in your proprietary data. (3) Build evaluation frameworks — automated tests that measure output quality over time. (4) Fine-tune on your domain once you have 1,000+ high-quality examples. The fine-tuned model is the moat.", steps: ["Data collection strategy: instrument your product to capture every user input, AI output, and user response (thumbs up/down, edit, ignore). This is your training data.", "RAG implementation: Supabase pgvector + OpenAI embeddings = a vector database you own. Chunk your proprietary knowledge base, embed it, and retrieve it at query time. Your LLM answers using your data, not its training data.", "Evaluation framework: write 50 test cases with expected outputs. Run them weekly. Track quality over time. This prevents regression and proves your AI is getting smarter.", "Fine-tuning trigger: when you have 1,000+ high-quality input/output pairs with human validation, fine-tune a smaller model (Llama 3, Mistral) on your domain. A fine-tuned 7B model often outperforms GPT-4 on domain-specific tasks at 1/10th the cost.", "Moat signal: you know your AI moat is real when a competitor who builds the same feature with a generic LLM produces visibly worse outputs. That's the gap you're protecting."], warning: "Don't fine-tune too early. Fine-tuning on low-quality data makes your model worse, not better. The minimum threshold is 1,000 human-validated examples. Below that, RAG + prompt engineering outperforms fine-tuning consistently.", proTip: "The highest-ROI AI investment for most startups: a great system prompt. Most founders underinvest in prompt engineering and overinvest in model selection. A perfectly crafted system prompt with GPT-4o-mini often outperforms a poorly prompted GPT-4 run at 1/10th the cost." } },
      { id: "ai4", title: "Agent Infrastructure: Running 10 Employees Worth of Work with $200/month", free: false, tagline: "The specific agent workflows we use internally.", content: { insight: "AI agents — LLMs that can take sequences of actions autonomously — are the most significant productivity multiplier since the spreadsheet. A well-designed agent can replace 80% of the work of a junior researcher, a content writer, a data analyst, and a customer support rep simultaneously. The key word is 'well-designed.' Poorly designed agents hallucinate, loop, and cause more work than they save. This lesson is about the agent workflows that actually work.", tactic: "The agent framework that works: define the task in terms of inputs, outputs, and success criteria FIRST. Then build the agent. Most agents fail because the task is underspecified. 'Research competitors' fails. 'For each of these 5 competitors, extract their pricing page URL, current pricing tiers and prices, and the 3 most common G2 complaints — output as structured JSON' succeeds.", steps: ["Research Agent: Perplexity API + Claude. Input: a research question. Output: a structured brief with sources. Cost: $0.05 per report. Replace: 2 hours of manual research.", "Content Agent: Claude Sonnet + your brand guidelines as system prompt. Input: topic + key points. Output: draft LinkedIn post, newsletter section, and email. Review and edit (10 min). Cost: $0.02. Replace: 90 minutes of writing.", "Competitive Intelligence Agent: Firecrawl (web scraping) + Claude. Weekly scan of competitor landing pages, pricing pages, and job listings. Output: change report with highlighted differences. Cost: $5/month. Replace: weekly manual monitoring.", "Customer Support Agent: your knowledge base + Claude + Intercom webhook. Handles 70% of Tier 1 support tickets automatically with human escalation for edge cases. Cost: $50/month. Replace: 1 part-time support person.", "Orchestration: n8n (self-hosted, free) or Make.com ($9/month) to connect agents, trigger workflows, and route outputs. This is the agent coordinator that makes individual agents work as a system."], warning: "Never deploy an agent to external users without a human review loop on a sample of outputs. Agents confidently produce wrong answers. Build evaluation and escalation into every agent workflow before you trust it with customer-facing tasks.", proTip: "The best agent ROI: automate your own weekly tasks first. Before you build agents for your customers, spend 2 weeks automating everything you do manually that takes more than 30 minutes. This teaches you how agents fail in practice — the most valuable education you can get before building agent features into your product." } },
    ]
  },
  {
    id: "liquidity",
    title: "Engineering the Exit",
    tagline: "Build to sell from day one — even if you never sell.",
    description: "The financial, legal, and strategic structures that 10× your acquisition multiple. What acquirers actually buy. What kills deals. How to position without ever running a formal process.",
    lessons: [
      {
        id: "liq1",
        title: "The 3 Things That 10× Your Exit Multiple",
        free: true,
        tagline: "Multiple buyers compete for the same company. Here's why.",
        content: {
          insight: "Exit multiples are not random. They are driven by three things in this order: (1) Predictability of revenue — ARR with low churn at a high NPS. (2) Irreplaceability of customer relationships — a customer list the acquirer can't buy or replicate any other way. (3) Technical moat — something that would take them 18+ months to rebuild internally. Without all three, you're leaving 40–70% of your exit price on the table.",
          tactic: "What acquirers actually buy: they're buying your distribution. Not your code — your code can be rewritten in 18 months. Not your team — your team will leave after the earnout anyway. Your customer list, your brand, and the trust you've accumulated are the irreplaceable assets. Build those obsessively from Day 1.",
          steps: [
            "Start tracking NPS from your first 10 customers. You need 50+ (ideally 70+) to command a premium multiple",
            "Document your customer relationships — not just CRM data, but relationship depth. Who has your CEO's personal number? Who refers other customers? That network is a line item in your valuation",
            "Identify your technical moat today: what would it cost a competitor to replicate what you've built? If the answer is 'less than 6 months,' it's not a moat. Build something that takes 18+",
            "The pre-exit checklist: clean cap table (no uncapped SAFEs), documented SOPs for every function, auditable financials for 24 months (bank statements must match P&L month by month)",
            "Start the acquisition conversation 18 months before you want to close. Relationships close deals. Cold outreach to acquirers produces 10× lower valuations than warm introductions."
          ],
          warning: "The biggest exit killer: uncapped SAFEs from early rounds. They create cap table complexity that terrifies acquirers' legal teams. If you have them, cap them now, before you start the exit process. It is worth the dilution.",
          proTip: "The best way to get acquisition interest: stop trying to get acquired. Publish your metrics publicly (if you can), build a brand that makes you look like the category leader, and let acquirers come to you. The moment you approach them, you've already negotiated against yourself."
        }
      },
      {
        id: "liq2",
        title: "Secondary Markets: Taking Chips Off Before the Exit",
        free: true,
        tagline: "You can sell equity before the company sells. Most founders don't know this.",
        content: {
          insight: "Secondary transactions — selling your existing shares to a new investor before an exit — are available to founders as early as Series A in some cases. You can sell 10–20% of your position, take cash off the table, and keep building. This is not rare. It's standard. Most founders don't do it because nobody told them it was an option.",
          tactic: "QSBS (Qualified Small Business Stock, Section 1202) exempts up to $10M in federal capital gains tax if you hold shares for 5 years from issuance. For a $50M exit, that's potentially $2M+ in tax savings. This requires specific corporate structure decisions made at incorporation — not at exit. If you haven't checked your QSBS eligibility, do it this week.",
          steps: [
            "Platforms for secondary transactions: Forge Global, Nasdaq Private Market, Caplight, direct secondary with existing investors or new strategics",
            "The negotiation lever: a secondary sale sets a market price for your equity. If you sold at $X/share, it's now harder for a primary investor to argue you're worth less",
            "QSBS checklist: C-corp (not LLC), under $50M in gross assets at time of issuance, active business (not investment vehicle), held for 5+ years. Talk to a tax attorney — one session, ~$500",
            "Earnout negotiation: if an acquirer offers an earnout (deferred payment tied to future performance), negotiate the metrics carefully. Acquirers routinely structure earnouts so the targets are missed. Push for metrics you control, not metrics dependent on their integration decisions",
            "The secondary market truth: take money off the table when it's available. The difference between a $5M personal exit and a $500k personal exit is often one secondary transaction you didn't know you could do."
          ],
          warning: "Secondary transactions require board approval and often right-of-first-refusal from existing investors. Know your shareholder agreement before you start the process. Surprising your investors with a secondary is a relationship-killer.",
          proTip: "Tax efficiency at exit is worth more than most features you'll ever ship. A founder who does one hour of tax planning per quarter saves more money than a feature that takes 6 weeks to build. Hire a startup-specialist CPA from Day 1. Their fee pays for itself in the first quarter."
        }
      },
      { id: "liq3", title: "IPO Infrastructure: What Public-Company-Ready Actually Means", free: false, tagline: "The internal systems that separate acqui-hires from proper exits.", content: { insight: "Only 1% of venture-backed companies IPO. But the infrastructure required to go public — audited financials, board governance, documented processes, SOC 2 compliance — is also what makes you the most attractive acquisition target. Building IPO-ready infrastructure is not about going public. It's about creating the conditions under which acquirers will pay the highest possible multiple.", tactic: "The Big 4 of IPO infrastructure that acquirers pay for: (1) Audited financials for 24+ months — bank statements matching P&L month by month. (2) Revenue recognition compliance (ASC 606) — especially for subscription businesses, how you recognize revenue matters legally. (3) SOC 2 Type II certification — required for enterprise sales and dramatically reduces acquirer diligence friction. (4) Board governance — independent directors, documented board resolutions, clean minute books.", steps: ["Start with clean books from Day 1. Use Bench or a startup-specialist bookkeeper ($300/month). Switching from messy to clean books costs $20k+ in accountant fees. Prevention is 100× cheaper.", "Get SOC 2 Type II certification before you hit $2M ARR. Tools like Vanta ($500/month) automate 80% of the compliance work. Enterprise customers will require it and acquirers reward it.", "Implement revenue recognition correctly from your first invoice. For SaaS: revenue is recognized monthly as the service is delivered, not when cash is received. Your billing system must separate cash received from revenue recognized.", "Build a board before you think you need one. 2 independent advisors with relevant domain expertise who attend quarterly meetings and sign off on major decisions transforms your governance story for acquirers.", "The pre-acquisition checklist: clean cap table (no uncapped SAFEs), documented IP assignment from all contractors and employees, employment agreements with all staff, trademark registrations, domain and IP ownership verification."], warning: "The biggest exit killer is cap table complexity from early uncapped SAFEs. If you raised early money on uncapped SAFEs, cap them now. The dilution is worth the clean cap table — acquirers' legal teams will use uncapped SAFEs as a reason to lower your price or walk away.", proTip: "SOC 2 is the single best investment a B2B SaaS can make at $1M ARR. It takes 6 months, costs $15k–25k total, and it unlocks enterprise customers who require it AND signals to acquirers that you run a serious operation. The ROI is measured in millions of dollars in exit premium." } },
      { id: "liq4", title: "The Term Sheet Vault: Reading and Negotiating Acquisition Offers", free: false, tagline: "Clause-by-clause: what matters, what's negotiable, what kills you.", content: { insight: "Most founders receive their first term sheet and immediately focus on the headline number. That's the last thing you should focus on. The headline is negotiable. The structure determines what you actually take home. A $20M acquisition with a 2× liquidation preference, a 3-year earnout, and an 18-month escrow hold-back leaves the founder with significantly less than a $15M clean cash deal. Know the structure before you celebrate the number.", tactic: "The 5 clauses that determine what you actually receive: (1) Consideration type — cash vs. stock in acquirer vs. mix. Cash is real. Acquirer stock is a bet. (2) Liquidation preferences — if preferred shareholders have a 2× preference, they get paid first. Your common stock value is what's left. (3) Earnout structure — deferred payment tied to future performance. Read the metrics carefully. (4) Escrow/hold-back — typically 10–15% of deal value held for 12–18 months against indemnification claims. (5) Reps & warranties — what you're guaranteeing is true about the business. Breaches trigger clawbacks.", steps: ["Hire an M&A attorney, not your corporate attorney. M&A is a specialty. Your corporate attorney who set up your LLC is not the right person to negotiate a $10M acquisition. M&A attorneys work on contingency at lower fees — $50k–150k for a proper deal.", "Negotiate consideration first: push for 100% cash at close. Every dollar in earnout or acquirer stock is a dollar at risk. The closer to cash at close, the better your outcome.", "The earnout negotiation tactic: if they insist on earnout, push for short timeframes (12 months max) and metrics you control entirely (revenue from existing customer base, not new customer acquisition which depends on their sales team).", "Escrow negotiation: standard is 10–15% for 12–18 months. Push for 10% for 12 months. Cap the indemnification liability at the escrow amount (not the full deal value — this is standard but sometimes gets slipped in).", "The no-shop clause: standard is 30–60 days. Push for 30. Every day in exclusivity is a day you can't talk to competing buyers. Maintain your other conversations until the no-shop is signed — not before."], warning: "Never negotiate a term sheet without a competing offer, real or implied. 'We're in early conversations with two other parties' is not a lie if you've had any conversations at all. The moment you enter exclusivity with one acquirer, you've given up your most powerful leverage.", proTip: "The single question that tells you if an acquirer is serious: 'What's your typical timeline from LOI to close?' Serious acquirers say 60–90 days. Tire-kickers say 'it depends.' If they can't give you a timeline, they're not ready to close. Don't enter exclusivity." } },
    ]
  }
];
