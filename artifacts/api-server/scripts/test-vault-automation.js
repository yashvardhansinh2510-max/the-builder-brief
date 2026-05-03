import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_FILE = path.join(__dirname, '..', 'AUTOMATION_TEST_RESULTS.md');

// ── Config ──────────────────────────────────────────────────────────────────
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const CRON_SECRET = process.env.CRON_SECRET || '';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-key';

// ── Test results tracker ─────────────────────────────────────────────────────
const testResults = [];

async function logResult(jobName, status, issue = null, fixNeeded = false) {
  testResults.push({
    job: jobName,
    status,
    issue: issue || 'None',
    fixNeeded,
  });
  console.log(`[${status}] ${jobName}: ${issue || 'OK'}`);
}

// ── Database / API helpers ────────────────────────────────────────────────────
async function apiGet(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return { ok: res.ok, status: res.status, data: res.ok ? await res.json() : null };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message };
  }
}

async function apiPost(path, body = {}, headers = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status, data: res.ok ? await res.json() : await res.text() };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message };
  }
}

async function getSignalCount() {
  const { ok, data } = await apiGet('/api/signals/count');
  if (!ok) {
    console.warn('[WARN] /api/signals/count endpoint not found — skipping signal count check');
    return null;
  }
  return data?.count ?? 0;
}

async function getRecentSignals(limit) {
  const { ok, data } = await apiGet(`/api/signals/recent?limit=${limit}`);
  if (!ok) return [];
  return data?.signals || [];
}

// ── B2: Daily Monitoring Job ─────────────────────────────────────────────────
async function runDailyMonitoringJobTest() {
  console.log('\n--- Daily Monitoring Job Test ---');
  try {
    const countBefore = await getSignalCount();
    console.log(`[INFO] Signals before job: ${countBefore ?? 'unknown'}`);

    const jobResponse = await apiPost('/api/jobs/daily-monitoring', { trigger: 'manual' });

    if (!jobResponse.ok) {
      if (jobResponse.status === 404) {
        await logResult('Daily Monitoring Job', '❌', '/api/jobs/daily-monitoring endpoint not found (404) — route not yet implemented', true);
        return;
      }
      throw new Error(`Daily monitoring job failed: HTTP ${jobResponse.status}`);
    }

    const jobData = jobResponse.data;
    console.log(`[INFO] Job triggered with ID: ${jobData?.jobId}`);

    // Poll for completion (30s max)
    let jobComplete = false;
    let pollCount = 0;
    const maxPolls = 30;

    while (!jobComplete && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { ok, data: status } = await apiGet(`/api/jobs/${jobData?.jobId}/status`);
      if (ok && status?.completed) {
        jobComplete = true;
        console.log(`[INFO] Job completed in ${pollCount + 1}s`);
      }
      pollCount++;
    }

    if (!jobComplete) {
      throw new Error('Daily monitoring job timeout (>30s)');
    }

    const countAfter = await getSignalCount();
    console.log(`[INFO] Signals after job: ${countAfter ?? 'unknown'}`);

    if (countBefore !== null && countAfter !== null && countAfter > countBefore) {
      const newSignals = countAfter - countBefore;
      const recent = await getRecentSignals(newSignals);
      const allComplete = recent.every(s =>
        s.source_type && s.timestamp && s.vault_id && s.confidence_score !== null && s.content
      );
      if (allComplete) {
        await logResult('Daily Monitoring Job', '✅', `${newSignals} signals ingested with complete fields`, false);
      } else {
        await logResult('Daily Monitoring Job', '❌', 'Signals missing required fields', true);
      }
    } else if (countBefore === null) {
      await logResult('Daily Monitoring Job', '⚠️', 'Job triggered but signal count endpoint missing — cannot verify ingestion', false);
    } else {
      await logResult('Daily Monitoring Job', '❌', 'No new signals ingested after job completion', true);
    }
  } catch (err) {
    await logResult('Daily Monitoring Job', '❌', err.message, true);
  }
}

// ── B3: Friday Publish Job ───────────────────────────────────────────────────
async function runFridayPublishJobTest() {
  console.log('\n--- Friday Publish Job Test ---');
  try {
    // Step 1: Get list of published vaults (the only endpoint that exists: GET /api/vaults)
    const { ok: vaultsOk, data: vaultsData } = await apiGet('/api/vaults');
    if (!vaultsOk) {
      await logResult('Friday Publish Job', '❌', `/api/vaults returned error — cannot test publish flow`, true);
      return;
    }

    const vaults = Array.isArray(vaultsData) ? vaultsData : (vaultsData?.vaults || []);
    console.log(`[INFO] Found ${vaults.length} published vault(s)`);

    if (vaults.length === 0) {
      await logResult('Friday Publish Job', '⚠️', 'No vaults in DB to test publish against — seed data needed', false);
      return;
    }

    // Step 2: Attempt to mark a vault as published via POST /:id/publish
    const testVault = vaults[0];
    const vaultId = testVault.id;
    console.log(`[INFO] Testing publish flow for vault ID: ${vaultId}`);

    const publishRes = await apiPost(`/api/vaults/${vaultId}/publish`, {});
    if (!publishRes.ok) {
      if (publishRes.status === 404) {
        await logResult('Friday Publish Job', '❌', `POST /api/vaults/${vaultId}/publish returned 404 — admin route may need auth header adjustment`, true);
        return;
      }
      await logResult('Friday Publish Job', '❌', `Publish endpoint returned HTTP ${publishRes.status}`, true);
      return;
    }

    const updated = publishRes.data;
    console.log(`[INFO] Vault publish response: isPublished=${updated?.isPublished}`);

    if (!updated?.isPublished) {
      await logResult('Friday Publish Job', '❌', 'Vault publish API returned but isPublished is not true', true);
      return;
    }

    // Step 3: Verify vault is now published via GET
    const { ok: verifyOk, data: verified } = await apiGet(`/api/vaults/${vaultId}`);
    if (!verifyOk || !verified?.isPublished) {
      await logResult('Friday Publish Job', '❌', 'Vault publish confirmed by response but GET /api/vaults/:id does not reflect it', true);
      return;
    }

    console.log('[INFO] Vault confirmed published in DB');

    // Step 4: Check for email log endpoint (may not exist)
    const { ok: emailLogOk, status: emailStatus } = await apiGet('/api/email/logs');
    if (!emailLogOk) {
      console.warn(`[WARN] /api/email/logs returned ${emailStatus} — email verification skipped`);
    }

    // Step 5: Check for Slack log endpoint (may not exist)
    const { ok: slackLogOk, status: slackStatus } = await apiGet('/api/slack/logs');
    if (!slackLogOk) {
      console.warn(`[WARN] /api/slack/logs returned ${slackStatus} — Slack verification skipped`);
    }

    const note = [
      'Vault publish: ✅',
      emailLogOk ? 'Email log: ✅' : `Email log: ⚠️ endpoint missing (${emailStatus})`,
      slackLogOk ? 'Slack log: ✅' : `Slack log: ⚠️ endpoint missing (${slackStatus})`,
    ].join(' | ');

    await logResult('Friday Publish Job', emailLogOk && slackLogOk ? '✅' : '⚠️', note, !emailLogOk || !slackLogOk);
  } catch (err) {
    await logResult('Friday Publish Job', '❌', err.message, true);
  }
}

// ── B4: Email Notification ────────────────────────────────────────────────────
async function runEmailNotificationTest() {
  console.log('\n--- Email Notification Test ---');
  try {
    if (!CRON_SECRET) {
      await logResult('Email Notifications', '⚠️', 'CRON_SECRET env var not set — cannot authenticate cron endpoint', false);
      return;
    }

    // The /api/cron/newsletter endpoint exists in cron.ts
    const res = await apiGet('/api/cron/newsletter', {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    // Use a manual fetch here since apiGet doesn't support custom header override easily
    const rawRes = await fetch(`${BASE_URL}/api/cron/newsletter`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    if (rawRes.status === 401) {
      await logResult('Email Notifications', '❌', 'Cron newsletter endpoint returned 401 — CRON_SECRET mismatch', true);
      return;
    }

    if (!rawRes.ok) {
      await logResult('Email Notifications', '❌', `Cron newsletter returned HTTP ${rawRes.status}`, true);
      return;
    }

    const data = await rawRes.json();
    console.log(`[INFO] Newsletter cron response: sent=${data.sent}, issue=${data.issue}`);

    if (data.sent > 0) {
      await logResult('Email Notifications', '✅', `${data.sent} emails sent for issue #${data.issue}`, false);
    } else if (data.sent === 0) {
      await logResult('Email Notifications', '⚠️', `No emails sent — ${data.message || 'no confirmed subscribers'}`, false);
    } else {
      await logResult('Email Notifications', '❌', 'Unexpected response shape from cron endpoint', true);
    }
  } catch (err) {
    await logResult('Email Notifications', '❌', err.message, true);
  }
}

// ── B5: Slack Notification ────────────────────────────────────────────────────
async function runSlackNotificationTest() {
  console.log('\n--- Slack Notification Test ---');
  try {
    // Check if SLACK_WEBHOOK_URL is configured on the server
    const { ok: envOk, data: envData } = await apiGet('/api/health');
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      // Check server health for any Slack indicator
      console.warn('[WARN] SLACK_WEBHOOK_URL not set in test environment');
      if (envOk && envData?.slack === false) {
        await logResult('Slack Notifications', '⚠️', 'Server reports Slack not configured (SLACK_WEBHOOK_URL missing)', false);
      } else {
        await logResult('Slack Notifications', '⚠️', 'SLACK_WEBHOOK_URL not set — Slack test skipped', false);
      }
      return;
    }

    // Fire a test message to the Slack webhook
    const slackPayload = {
      text: `🤖 *Vault Automation Test* — Slack notification test fired at ${new Date().toISOString()}`,
    };

    const slackRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (slackRes.ok) {
      await logResult('Slack Notifications', '✅', 'Test message posted to Slack webhook successfully', false);
    } else {
      await logResult('Slack Notifications', '❌', `Slack webhook returned HTTP ${slackRes.status}`, true);
    }
  } catch (err) {
    await logResult('Slack Notifications', '❌', err.message, true);
  }
}

// ── Results writer ────────────────────────────────────────────────────────────
async function writeResultsFile() {
  const passing = testResults.filter(r => r.status === '✅').length;
  const failing = testResults.filter(r => r.status === '❌').length;
  const warning = testResults.filter(r => r.status === '⚠️' || r.status === '⏳').length;

  const markdown = `# Vault Automation Test Results

**Date:** ${new Date().toISOString()}
**API Base:** ${BASE_URL}

## Results

| Job | Status | Issue | Fix Needed |
|-----|--------|-------|------------|
${testResults.map(r => `| ${r.job} | ${r.status} | ${r.issue} | ${r.fixNeeded ? 'Yes' : 'No'} |`).join('\n')}

## Summary

| Metric | Count |
|--------|-------|
| Total jobs tested | ${testResults.length} |
| ✅ Passing | ${passing} |
| ❌ Failing | ${failing} |
| ⚠️ Warning / Skipped | ${warning} |

## Gaps Identified

${testResults
  .filter(r => r.fixNeeded)
  .map(r => `- **${r.job}**: ${r.issue}`)
  .join('\n') || 'No critical gaps found.'}

## Endpoint Availability

| Endpoint | Status |
|----------|--------|
| \`GET /api/vaults\` | ✅ exists |
| \`POST /api/vaults/:id/publish\` | ✅ exists (admin-only) |
| \`GET /api/cron/newsletter\` | ✅ exists |
| \`POST /api/jobs/daily-monitoring\` | ❌ not implemented |
| \`GET /api/jobs/:id/status\` | ❌ not implemented |
| \`GET /api/signals/count\` | ❌ not implemented |
| \`GET /api/signals/recent\` | ❌ not implemented |
| \`GET /api/email/logs\` | ❌ not implemented |
| \`GET /api/slack/logs\` | ❌ not implemented |

## Next Steps

${failing > 0 || testResults.some(r => r.fixNeeded) ? `
1. Implement missing job endpoints: \`/api/jobs/daily-monitoring\`, \`/api/jobs/:id/status\`
2. Implement signal count/recent endpoints for job verification
3. Add email/Slack audit log endpoints for post-publish verification
4. Re-run this harness after implementing above
` : 'All jobs passing. Archive page integration testing can proceed.'}
`;

  fs.writeFileSync(RESULTS_FILE, markdown, 'utf-8');
  console.log(`\nResults written to ${RESULTS_FILE}`);
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function runAllTests() {
  console.log('=== Vault Automation Test Harness ===');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`API Base: ${BASE_URL}\n`);

  await runDailyMonitoringJobTest();
  await runFridayPublishJobTest();
  await runEmailNotificationTest();
  await runSlackNotificationTest();

  await writeResultsFile();

  console.log('\n=== Test Harness Complete ===');
  const failing = testResults.filter(r => r.status === '❌').length;
  console.log(`Passed: ${testResults.filter(r => r.status === '✅').length} | Failed: ${failing} | Warnings: ${testResults.filter(r => r.status === '⚠️').length}`);
}

export {
  runDailyMonitoringJobTest,
  runFridayPublishJobTest,
  runEmailNotificationTest,
  runSlackNotificationTest,
  runAllTests,
};

if (process.argv[1] === __filename || process.argv[1]?.endsWith('test-vault-automation.js')) {
  runAllTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
