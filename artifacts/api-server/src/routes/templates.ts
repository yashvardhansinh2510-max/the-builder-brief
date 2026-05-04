import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";

const router = Router();

const TEMPLATES = {
  landing_page: {
    name: "Landing Page Framework",
    content: `# Landing Page Framework

## Header Section
- [Hero Section]
  - Headline: Clear, benefit-focused value proposition
  - Subheadline: Explain what problem you solve
  - CTA Button: Primary action (Free Trial / Start Now)

## Problem Section
- 2-3 paragraphs describing pain points your target audience faces
- Use data/statistics if available
- End with transformation statement

## Solution Section
- How your product/service solves the problem
- Keep it simple and benefit-focused

## Key Features (3-5)
- Feature name
- Benefit of feature
- Why it matters

## Social Proof
- Customer testimonials
- Logo of notable clients
- Statistics (users, satisfaction, etc.)

## Pricing Section
- Simple 2-3 tier pricing
- Include CTA per tier

## FAQ
- 3-5 most common questions
- Concise answers

## Footer CTA
- Compelling final offer
- Easy signup/contact form`,
  },

  cold_email: {
    name: "Cold Email Sequences",
    content: `# Cold Email Sequence Template

## Email 1: The Hook (Day 1)
Subject: [Question that creates curiosity]

Hi [First Name],

Quick question - have you noticed [industry trend/pain point]?

The reason I ask is we've been working with teams like [similar company] to [specific outcome].

Curious if that's something you're facing?

[Your Name]

---

## Email 2: Value Add (Day 3)
Subject: Re: [Previous subject]

Hi [First Name],

Since I didn't hear back, thought I'd share something that might be useful.

[Link to relevant article/resource relevant to their business]

Figured it might be helpful given your focus on [their industry/product].

Let me know if you have any thoughts.

[Your Name]

---

## Email 3: Social Proof (Day 5)
Subject: [Similar company] is seeing [result]

Hi [First Name],

Quick update - [similar company] just [achieved result] using [your solution].

Their situation was pretty similar to what I'd imagine you're dealing with in [their area].

If you want to see how they did it, happy to share.

[Your Name]

---

## Email 4: The Ask (Day 7)
Subject: One more thing...

Hi [First Name],

Last attempt - would a brief 15-min call make sense to see if there's a fit?

No pressure if not the right time.

[Meeting link]

[Your Name]`,
  },

  prd: {
    name: "Product Requirements Doc (PRD)",
    content: `# Product Requirements Document

## 1. Product Overview
### Vision
[Long-term vision for the product]

### Mission
[What we're building and why it matters]

### Target Customer
[Who is this for]

### Problem Statement
[What problem does this solve]

---

## 2. Goals & Success Metrics
### Primary Goals
- Goal 1: [Metric to track success]
- Goal 2: [Metric to track success]

### KPIs
- Metric 1: Current [X], Target [Y] by [date]
- Metric 2: Current [X], Target [Y] by [date]

---

## 3. Feature Specifications

### Feature 1: [Name]
**Description:** What it does and why

**User Story:** As a [user type], I want [action] so that [benefit]

**Acceptance Criteria:**
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

**Technical Notes:** Any technical constraints

---

## 4. User Experience Flow
[Describe how users interact with the feature]

---

## 5. Success Criteria
- Shipping deadline: [Date]
- Quality standards: [Specifics]
- Performance benchmarks: [Specifics]

---

## 6. Open Questions
- [Question 1]
- [Question 2]`,
  },

  gtm: {
    name: "Go-to-Market Strategy",
    content: `# Go-to-Market Strategy

## 1. Target Market Sizing
### TAM (Total Addressable Market)
[Size and how calculated]

### SAM (Serviceable Available Market)
[Realistic initial target]

### SOM (Serviceable Obtainable Market)
[Year 1 target market share]

---

## 2. Buyer Personas
### Persona 1: [Name]
- Role: [Title]
- Company size: [Range]
- Pain points: [1-3 key issues]
- Buying process: [Typically how they evaluate]

---

## 3. Go-to-Market Channels
### Channel 1: [Type]
- How we'll reach customers: [Specific tactics]
- Estimated CAC: [Cost per acquisition]
- Timeline to first customer: [Weeks]

### Channel 2: [Type]
[Same format]

---

## 4. Messaging & Positioning
### Core Message
[Single-sentence value prop]

### Key Differentiators
1. [Difference 1]
2. [Difference 2]
3. [Difference 3]

---

## 5. Launch Timeline
- Week 1-2: [Preparation tasks]
- Week 3-4: [Launch tasks]
- Week 5-8: [Initial customer acquisition]

---

## 6. Success Metrics (First 90 days)
- Customer acquisition target: [Number]
- Average deal size: [Amount]
- Sales cycle length: [Duration]

---

## 7. Contingency Plans
If [situation], then [response]`,
  },

  pitch_deck: {
    name: "Pitch Deck (Investor Ready)",
    content: `# Pitch Deck Outline - 10 Slides

## Slide 1: Title Slide
- Company name
- Tagline/mission
- Founder name(s)
- Date

## Slide 2: The Problem
- Market problem in plain English
- Who has this problem
- Why it matters (with data if possible)

## Slide 3: The Solution
- How you solve the problem
- Why your approach is unique
- Visual of product if possible

## Slide 4: Market Opportunity
- TAM/SAM/SOM
- Growth rate
- Why now is the time

## Slide 5: Business Model
- How you make money
- Pricing strategy
- Customer acquisition strategy

## Slide 6: Traction
- Key metrics (users, revenue, MoM growth)
- Notable customers
- Partnerships or mentions

## Slide 7: Competitive Landscape
- Key competitors
- Why you're differentiated
- Your competitive advantage

## Slide 8: The Team
- Founders + key team members
- Relevant experience
- Why you're the team to execute

## Slide 9: Financial Projections
- 3-year revenue projections
- Unit economics
- Path to profitability

## Slide 10: The Ask
- How much you're raising
- Use of funds (with %)
- What investors get`,
  },

  customer_dev: {
    name: "Customer Development Script",
    content: `# Customer Development Interview Script

## Opening (2 minutes)
"Hi [Name], thanks so much for taking time to chat. We're trying to understand how [industry professionals] approach [problem area]. Your perspective would be super valuable. Is now still a good time?"

---

## Background (3 minutes)
"To start - can you tell me about your role at [Company] and what your main responsibilities are?"

"What does a typical day/week look like for you?"

---

## Problem Discovery (10 minutes)
"When you're working on [their primary task], what's the hardest part?"

"Walk me through the last time you ran into that challenge. What happened?"

"What tools or approaches are you currently using to handle this?"

"What's not working about that approach?"

"If you could wave a magic wand and fix one thing about this process, what would it be?"

---

## Solution Exploration (5 minutes)
"I'm curious - if [your solution] could help you [specific outcome], would that be valuable?"

"What would 'good' look like for you?"

"How much time/money would solving this be worth?"

---

## Closing (2 minutes)
"Is there anyone else on your team I should talk to about this?"

"Would you be open to chatting again in a few weeks after we've made some progress?"

---

## Notes
- Listen 70%, talk 30%
- Ask "why?" multiple times
- Don't pitch - just ask questions
- Take notes on their exact language`,
  },
};

router.get("/:templateId", verifyUser, async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = TEMPLATES[templateId as keyof typeof TEMPLATES];

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const filename = `${templateId.replace(/_/g, "-")}.md`;
    res.setHeader("Content-Type", "text/markdown");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(template.content);
  } catch (error) {
    console.error("Error downloading template:", error);
    return res.status(500).json({ error: "Failed to download template" });
  }
});

export default router;
