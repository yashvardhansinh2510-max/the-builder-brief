import { Resend } from "resend";
import { db, subscribersTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function welcomeHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to The Build Brief</title>
</head>
<body style="margin:0;padding:0;background:#F8F4EF;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EF;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#E9591C;padding:36px 48px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#FFFFFF;letter-spacing:-0.5px;">
                The Build Brief
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;">
                Issue #009 drops this Friday
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 40px;">
              <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;color:#0D0D0D;line-height:1.3;">
                You're in.
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#4A4238;line-height:1.65;">
                Every Friday, one complete startup blueprint lands in your inbox — a real company idea, fully built out with market research, a 6-step build plan, and copy-paste Claude prompts.
              </p>
              <p style="margin:0 0 32px;font-size:16px;color:#4A4238;line-height:1.65;">
                No fluff. No theory. Just actionable intelligence you can act on before the weekend is over.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#E9591C;border-radius:100px;padding:14px 32px;">
                    <a href="https://build.specflowai.com/issue/rentshield" style="color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:500;">
                      Read the latest issue →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:0;" />
            </td>
          </tr>

          <!-- What's inside -->
          <tr>
            <td style="padding:36px 48px 40px;">
              <p style="margin:0 0 20px;font-size:12px;color:#8C7B6E;letter-spacing:2px;text-transform:uppercase;">Each issue includes</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${[
                  ["The Idea", "A named startup concept — not a category, a company"],
                  ["Why Now", "3 bullets on why this window is open today"],
                  ["Build Blueprint", "6 concrete steps to ship v1 from zero"],
                  ["Claude Prompts", "3–5 copy-paste prompts for this exact build"],
                  ["First Revenue Path", "Exactly how to charge the first customer"],
                  ["First 10 Customers", "A specific, unglamorous, works-in-real-life strategy"],
                ].map(([title, desc]) => `
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:20px;">
                    <span style="color:#E9591C;font-size:16px;">→</span>
                  </td>
                  <td style="padding:8px 0 8px 10px;">
                    <span style="font-size:14px;color:#0D0D0D;font-weight:500;">${title}</span>
                    <span style="font-size:14px;color:#6B6459;"> — ${desc}</span>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8F4EF;padding:24px 48px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:12px;color:#8C7B6E;">
                You subscribed at <a href="https://build.specflowai.com" style="color:#8C7B6E;">build.specflowai.com</a> with ${email}.
                <a href="https://build.specflowai.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8C7B6E;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping welcome email");
    return;
  }

  const fromDomain = process.env.EMAIL_FROM_DOMAIN ?? "resend.dev";
  const fromAddress =
    fromDomain === "resend.dev"
      ? "The Build Brief <onboarding@resend.dev>"
      : `The Build Brief <hello@${fromDomain}>`;

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "You're in — Issue #009 drops this Friday",
    html: welcomeHtml(email),
  });

  if (error) {
    logger.error({ error }, "Failed to send welcome email");
  } else {
    logger.info({ email }, "Welcome email sent");
  }
}

function weeklySignalHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Build Brief — This Friday's Signal</title>
</head>
<body style="margin:0;padding:0;background:#F8F4EF;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EF;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#E9591C;padding:36px 48px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#FFFFFF;letter-spacing:-0.5px;">The Build Brief</p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;">Weekly Signal — Friday Drop</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 48px 40px;">
              <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;color:#0D0D0D;line-height:1.3;">This week's market gap is open.</p>
              <p style="margin:0 0 20px;font-size:16px;color:#4A4238;line-height:1.65;">One complete startup blueprint, deconstructed — market research, build plan, first revenue path, and copy-paste Claude prompts.</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#E9591C;border-radius:100px;padding:14px 32px;">
                    <a href="https://build.specflowai.com/archive" style="color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:500;">Read this week's blueprint →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#F8F4EF;padding:24px 48px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:12px;color:#8C7B6E;">
                You subscribed at <a href="https://build.specflowai.com" style="color:#8C7B6E;">build.specflowai.com</a> with ${email}.
                <a href="https://build.specflowai.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8C7B6E;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function dailyBriefingHtml(email: string, summary: string, highlights: string[], briefId: number): string {
  const trackingPixel = `${process.env.API_URL || "https://api.specflowai.com"}/api/track/open/${briefId}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Build Brief — Daily Venture Drop</title>
</head>
<body style="margin:0;padding:0;background:#F8F4EF;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EF;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#0D0D0D;padding:36px 48px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#FFFFFF;letter-spacing:-0.5px;">The Build Brief</p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;">Daily Venture Drop — Personalized</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 48px 40px;">
              <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:22px;color:#0D0D0D;line-height:1.3;">${summary}</p>
              
              <p style="margin:24px 0 12px;font-size:14px;color:#8C7B6E;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Key Signals</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${highlights.map(h => `
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:20px;">
                    <span style="color:#E9591C;font-size:16px;">→</span>
                  </td>
                  <td style="padding:8px 0 8px 10px;font-size:15px;color:#4A4238;line-height:1.5;">
                    ${h}
                  </td>
                </tr>`).join("")}
              </table>

              <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="background:#0D0D0D;border-radius:100px;padding:14px 32px;">
                    <a href="https://build.specflowai.com/dashboard" style="color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:500;">Go to Portal →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#F8F4EF;padding:24px 48px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:12px;color:#8C7B6E;">
                Pro/Max member at <a href="https://build.specflowai.com" style="color:#8C7B6E;">build.specflowai.com</a> — ${email}.
                <a href="https://build.specflowai.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8C7B6E;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
        <img src="${trackingPixel}" width="1" height="1" style="display:none;" />
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWeeklySignal(): Promise<{ sent: number; failed: number }> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping weekly signal");
    return { sent: 0, failed: 0 };
  }

  const fromDomain = process.env.EMAIL_FROM_DOMAIN ?? "resend.dev";
  const fromAddress = fromDomain === "resend.dev"
    ? "The Build Brief <onboarding@resend.dev>"
    : `The Build Brief <hello@${fromDomain}>`;

  const subscribers = await db
    .select({ email: subscribersTable.email })
    .from(subscribersTable)
    .where(eq(subscribersTable.unsubscribed, false));

  let sent = 0;
  let failed = 0;

  for (const { email } of subscribers) {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "This Friday's market gap is open",
      html: weeklySignalHtml(email),
    });
    if (error) { failed++; logger.error({ error, email }, "Weekly signal send failed"); }
    else { sent++; }
  }

  logger.info({ sent, failed }, "Weekly signal batch complete");
  return { sent, failed };
}

export async function sendDailyBriefingForUser(email: string, summary: string, highlights: string[], briefId: number): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping daily briefing");
    return;
  }

  const fromDomain = process.env.EMAIL_FROM_DOMAIN ?? "resend.dev";
  const fromAddress = fromDomain === "resend.dev"
    ? "The Build Brief <onboarding@resend.dev>"
    : `The Build Brief <hello@${fromDomain}>`;

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "Today's venture drop",
    html: dailyBriefingHtml(email, summary, highlights, briefId),
  });

  if (error) {
    logger.error({ error, email }, "Daily briefing send failed");
  } else {
    logger.info({ email }, "Daily briefing sent");
  }
}
