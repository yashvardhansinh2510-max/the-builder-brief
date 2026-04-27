export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function freeToProHealthScore(founderName: string, offerId: string): EmailTemplate {
  const upgradeUrl = `https://thebuilderbrief.com/upgrade/pro?offerId=${offerId}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hey ${founderName},</p>

      <p>Your scorecard just showed something that matters: your core metrics are off, and you probably already know why.</p>

      <p>Most founders at this stage try to fix everything at once. They burn out. The ones who don't? They focus on one thing—the one lever that actually moves the needle for their stage.</p>

      <p>Pro tier unlocks exactly that: a playbook built by founders who've been in your exact position, insights on what actually works at your stage, and direct access to founders who've solved this already.</p>

      <p style="margin: 30px 0;">
        <a href="${upgradeUrl}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Unlock Pro → See the Playbook</a>
      </p>

      <p style="color: #666; font-size: 14px;">
        Offer expires in 7 days. No credit card required to start.
      </p>

      <p>—The Builder Brief</p>
    </div>
  `;

  const text = `Hey ${founderName},

Your scorecard just showed something that matters: your core metrics are off, and you probably already know why.

Most founders at this stage try to fix everything at once. They burn out. The ones who don't? They focus on one thing—the one lever that actually moves the needle for their stage.

Pro tier unlocks exactly that: a playbook built by founders who've been in your exact position, insights on what actually works at your stage, and direct access to founders who've solved this already.

Unlock Pro → See the Playbook
${upgradeUrl}

Offer expires in 7 days. No credit card required to start.

—The Builder Brief`;

  return {
    subject: "Your metrics just showed something important",
    html,
    text,
  };
}

export function freeToProPlaybookClicks(founderName: string, offerId: string): EmailTemplate {
  const upgradeUrl = `https://thebuilderbrief.com/upgrade/pro?offerId=${offerId}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hey ${founderName},</p>

      <p>I noticed you've been digging into the playbook—clicking through the locked sections, trying to see the full picture. That's the right instinct.</p>

      <p>You're at the point where you know something is broken, and you're ready for a map, not more opinions. The playbook is that map: real solutions from founders who've shipped exactly what you're trying to ship, tailored to your stage and market.</p>

      <p>Pro tier unlocks it all. Plus founder calls, market intelligence specific to your competitive landscape, and weekly insights that actually apply to your situation (not generic SaaS advice).</p>

      <p style="margin: 30px 0;">
        <a href="${upgradeUrl}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Upgrade to Pro</a>
      </p>

      <p style="color: #666; font-size: 14px;">
        Your 7-day access window expires soon. No credit card required.
      </p>

      <p>—The Builder Brief</p>
    </div>
  `;

  const text = `Hey ${founderName},

I noticed you've been digging into the playbook—clicking through the locked sections, trying to see the full picture. That's the right instinct.

You're at the point where you know something is broken, and you're ready for a map, not more opinions. The playbook is that map: real solutions from founders who've shipped exactly what you're trying to ship, tailored to your stage and market.

Pro tier unlocks it all. Plus founder calls, market intelligence specific to your competitive landscape, and weekly insights that actually apply to your situation (not generic SaaS advice).

Upgrade to Pro
${upgradeUrl}

Your 7-day access window expires soon. No credit card required.

—The Builder Brief`;

  return {
    subject: "You're ready for the full playbook",
    html,
    text,
  };
}

export function freeToProUsagePattern(founderName: string, offerId: string): EmailTemplate {
  const upgradeUrl = `https://thebuilderbrief.com/upgrade/pro?offerId=${offerId}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hey ${founderName},</p>

      <p>You've been consistent with the scorecard. That's where most founders stop—they diagnose the problem and never fix it.</p>

      <p>You're different. You're looking for the fix. Pro is built for exactly this: it's not more information. It's the playbook from founders who've actually solved this, founder calls with people at your stage, and market intelligence tailored to your specific situation.</p>

      <p>This is the step between knowing what's broken and actually fixing it.</p>

      <p style="margin: 30px 0;">
        <a href="${upgradeUrl}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Upgrade to Pro</a>
      </p>

      <p style="color: #666; font-size: 14px;">
        Offer expires in 7 days. $25/month, cancel anytime.
      </p>

      <p>—The Builder Brief</p>
    </div>
  `;

  const text = `Hey ${founderName},

You've been consistent with the scorecard. That's where most founders stop—they diagnose the problem and never fix it.

You're different. You're looking for the fix. Pro is built for exactly this: it's not more information. It's the playbook from founders who've actually solved this, founder calls with people at your stage, and market intelligence tailored to your specific situation.

This is the step between knowing what's broken and actually fixing it.

Upgrade to Pro
${upgradeUrl}

Offer expires in 7 days. $25/month, cancel anytime.

—The Builder Brief`;

  return {
    subject: "Time to move from diagnosis to fix",
    html,
    text,
  };
}

export function proToMaxMilestoneHit(founderName: string, offerId: string, milestonesHit: number): EmailTemplate {
  const upgradeUrl = `https://thebuilderbrief.com/upgrade/max?offerId=${offerId}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hey ${founderName},</p>

      <p>You just hit ${milestonesHit} of your 3 Pro milestones. That's real traction.</p>

      <p>You've validated the playbook works. Now you need to accelerate. Max tier is built for this phase: quarterly deep dives with founders who've exited (not just hustlers), custom strategy sessions to plan your next sprint, and competitive intelligence that updates in real-time.</p>

      <p>You're past the "find the map" stage. You need a mentor who's been there.</p>

      <p style="margin: 30px 0;">
        <a href="${upgradeUrl}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Explore Max Tier</a>
      </p>

      <p style="color: #666; font-size: 14px;">
        Offer expires in 7 days. First month is half-price.
      </p>

      <p>—The Builder Brief</p>
    </div>
  `;

  const text = `Hey ${founderName},

You just hit ${milestonesHit} of your 3 Pro milestones. That's real traction.

You've validated the playbook works. Now you need to accelerate. Max tier is built for this phase: quarterly deep dives with founders who've exited (not just hustlers), custom strategy sessions to plan your next sprint, and competitive intelligence that updates in real-time.

You're past the "find the map" stage. You need a mentor who's been there.

Explore Max Tier
${upgradeUrl}

Offer expires in 7 days. First month is half-price.

—The Builder Brief`;

  return {
    subject: `You've proven the playbook. Time to accelerate.`,
    html,
    text,
  };
}

export function maxToIncubatorScoutInvite(founderName: string, offerId: string, scoutScore: number): EmailTemplate {
  const upgradeUrl = `https://thebuilderbrief.com/incubator/join?offerId=${offerId}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hey ${founderName},</p>

      <p>You're in the top 5% of founders we work with. We're not inviting you to join Incubator because we think you have potential. We're inviting you because you've already proven it.</p>

      <p>Incubator is different. It's not another tier of advice. It's us putting capital, network, and scar tissue behind your company. You get:</p>

      <ul style="line-height: 1.8;">
        <li><strong>Capital introductions</strong> to investors who've backed founders like you</li>
        <li><strong>Strategic partnerships</strong> with portfolio companies who could be your first customers or acquirers</li>
        <li><strong>Curated peer group</strong> of founders 6-12 months ahead of you, solving the problems you're about to hit</li>
        <li><strong>Equity in your company</strong> (0.5-2%) so we're aligned on your success long-term</li>
      </ul>

      <p>This is invitation-only. Your trajectory, market opportunity, and team credibility put you here.</p>

      <p style="margin: 30px 0;">
        <a href="${upgradeUrl}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">Learn About Incubator</a>
      </p>

      <p style="color: #666; font-size: 14px;">
        This invitation is valid for 30 days. Let's talk.
      </p>

      <p>—The Builder Brief Team</p>
    </div>
  `;

  const text = `Hey ${founderName},

You're in the top 5% of founders we work with. We're not inviting you to join Incubator because we think you have potential. We're inviting you because you've already proven it.

Incubator is different. It's not another tier of advice. It's us putting capital, network, and scar tissue behind your company. You get:

• Capital introductions to investors who've backed founders like you
• Strategic partnerships with portfolio companies who could be your first customers or acquirers
• Curated peer group of founders 6-12 months ahead of you, solving the problems you're about to hit
• Equity in your company (0.5-2%) so we're aligned on your success long-term

This is invitation-only. Your trajectory, market opportunity, and team credibility put you here.

Learn About Incubator
${upgradeUrl}

This invitation is valid for 30 days. Let's talk.

—The Builder Brief Team`;

  return {
    subject: `You're invited: Builder Brief Incubator`,
    html,
    text,
  };
}
