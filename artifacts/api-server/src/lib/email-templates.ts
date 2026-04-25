import { SITE_URL } from "./resend";

export function confirmationEmailHtml(token: string): string {
  const confirmUrl = `${SITE_URL}/api/subscribers/confirm?token=${token}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm your subscription</title>
</head>
<body style="margin:0;padding:0;background:#F8F4EF;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EF;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#E9591C;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">The Builder Brief</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#0D0D0D;font-family:Georgia,serif;">One click to confirm</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#6B6459;line-height:1.6;">
                You're almost in. Confirm your email to start receiving a fresh startup blueprint every Friday.
              </p>
              <a href="${confirmUrl}"
                 style="display:inline-block;background:#E9591C;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;">
                Confirm subscription
              </a>
              <p style="margin:32px 0 0;font-size:13px;color:#8C7B6E;">
                If the button doesn't work, copy and paste this link:<br>
                <a href="${confirmUrl}" style="color:#E9591C;word-break:break-all;">${confirmUrl}</a>
              </p>
              <p style="margin:24px 0 0;font-size:13px;color:#8C7B6E;">
                If you didn't sign up, ignore this email — you won't hear from us again.
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

export function newsletterEmailHtml(
  issue: {
    number: string;
    title: string;
    tagline: string;
    problem: string;
    whyNow: string[];
    blueprint: string[];
    prompts: string[];
    firstRevenue: string;
    firstTen: string;
  },
  unsubscribeEmail: string,
  unsubscribeUrl?: string
): string {
  const finalUnsubUrl =
    unsubscribeUrl ??
    `${SITE_URL}/api/subscribers/unsubscribe-link?email=${encodeURIComponent(unsubscribeEmail)}`;
  const blueprintItems = issue.blueprint
    .map(
      (step, i) =>
        `<tr><td style="padding:6px 0;"><span style="color:#E9591C;font-weight:700;">${i + 1}.</span> ${step}</td></tr>`
    )
    .join("");
  const promptItems = issue.prompts
    .map(
      (p) =>
        `<tr><td style="padding:8px 12px;background:#F8F4EF;border-radius:8px;font-size:14px;color:#0D0D0D;margin-bottom:8px;line-height:1.6;">${p}</td></tr>`
    )
    .join("<tr><td style='padding:4px 0;'></td></tr>");
  const whyNowItems = issue.whyNow
    .map((w) => `<li style="margin-bottom:8px;color:#6B6459;">${w}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The Builder Brief #${issue.number}: ${issue.title}</title>
</head>
<body style="margin:0;padding:0;background:#F8F4EF;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EF;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#E9591C;padding:24px 40px;">
              <p style="margin:0;color:#ffffff;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">The Builder Brief · Issue #${issue.number}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 0;">
              <h1 style="margin:0 0 12px;font-size:36px;font-weight:700;color:#0D0D0D;font-family:Georgia,serif;">${issue.title}</h1>
              <p style="margin:0 0 32px;font-size:16px;color:#6B6459;line-height:1.6;font-style:italic;">${issue.tagline}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">The Problem</h2>
              <p style="margin:0;font-size:15px;color:#0D0D0D;line-height:1.7;">${issue.problem}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">Why Now</h2>
              <ul style="margin:0;padding-left:20px;">
                ${whyNowItems}
              </ul>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">Build Blueprint</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${blueprintItems}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#E9591C;text-transform:uppercase;letter-spacing:0.05em;">Claude Prompts</h2>
              <table width="100%" cellpadding="0" cellspacing="8">
                ${promptItems}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">First Revenue Path</h2>
              <p style="margin:0;font-size:15px;color:#0D0D0D;line-height:1.7;">${issue.firstRevenue}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">First 10 Customers</h2>
              <p style="margin:0;font-size:15px;color:#0D0D0D;line-height:1.7;">${issue.firstTen}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#F8F4EF;border-top:1px solid rgba(0,0,0,0.08);">
              <p style="margin:0;font-size:12px;color:#8C7B6E;line-height:1.6;">
                You're receiving this because you subscribed at ${SITE_URL}.<br>
                <a href="${finalUnsubUrl}" style="color:#E9591C;">Unsubscribe</a>
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
