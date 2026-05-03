import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_FILE = path.join(__dirname, '..', 'AUTOMATION_TEST_RESULTS.md');

// Test results tracker
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

// Database helpers for testing
async function getSignalCount() {
  try {
    // Note: Update connection string and query as needed for your setup
    const response = await fetch('http://localhost:3000/api/signals/count');
    if (!response.ok) throw new Error('Failed to get signal count');
    const data = await response.json();
    return data.count || 0;
  } catch (err) {
    console.error('[ERROR] Could not get signal count:', err.message);
    return 0;
  }
}

async function getRecentSignals(limit) {
  try {
    const response = await fetch(`http://localhost:3000/api/signals/recent?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get recent signals');
    const data = await response.json();
    return data.signals || [];
  } catch (err) {
    console.error('[ERROR] Could not get recent signals:', err.message);
    return [];
  }
}

async function runDailyMonitoringJobTest() {
  console.log('\n--- Daily Monitoring Job Test ---');
  try {
    // Step 1: Get current signal count from database
    const countBefore = await getSignalCount();
    console.log(`[INFO] Signals before job: ${countBefore}`);

    // Step 2: Trigger the daily monitoring job
    // Note: Update this URL to match your actual job endpoint
    const jobResponse = await fetch('http://localhost:3000/api/jobs/daily-monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'manual' }),
    });

    if (!jobResponse.ok) {
      throw new Error(`Daily monitoring job failed: ${jobResponse.statusText}`);
    }

    const jobData = await jobResponse.json();
    console.log(`[INFO] Job triggered with ID: ${jobData.jobId}`);

    // Step 3: Wait for job completion (poll for up to 30 seconds)
    let jobComplete = false;
    let pollCount = 0;
    const maxPolls = 30;

    while (!jobComplete && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`http://localhost:3000/api/jobs/${jobData.jobId}/status`);
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        if (status.completed) {
          jobComplete = true;
          console.log(`[INFO] Job completed in ${(pollCount + 1)} seconds`);
        }
      }
      pollCount++;
    }

    if (!jobComplete) {
      throw new Error('Daily monitoring job timeout (>30 seconds)');
    }

    // Step 4: Get signal count after job
    const countAfter = await getSignalCount();
    console.log(`[INFO] Signals after job: ${countAfter}`);

    // Step 5: Verify new signals were ingested
    if (countAfter > countBefore) {
      const newSignals = countAfter - countBefore;
      console.log(`[SUCCESS] ${newSignals} new signals ingested`);

      // Verify signal data is complete
      const recentSignals = await getRecentSignals(newSignals);
      const allComplete = recentSignals.every(s => 
        s.source_type && s.timestamp && s.vault_id && s.confidence_score !== null && s.content
      );

      if (allComplete) {
        await logResult('Daily Monitoring Job', '✅', 'Signals ingested successfully', false);
      } else {
        await logResult('Daily Monitoring Job', '❌', 'Signals missing required fields', true);
      }
    } else {
      await logResult('Daily Monitoring Job', '❌', 'No new signals ingested', true);
    }
  } catch (err) {
    await logResult('Daily Monitoring Job', '❌', err.message, true);
  }
}

async function runFridayPublishJobTest() {
  console.log('\n--- Friday Publish Job Test ---');
  try {
    // Placeholder: will be implemented in Task B3
    await logResult('Friday Publish Job', '⏳', 'Test implementation pending', false);
  } catch (err) {
    await logResult('Friday Publish Job', '❌', err.message, true);
  }
}

async function runEmailNotificationTest() {
  console.log('\n--- Email Notification Test ---');
  try {
    // Placeholder: will be implemented in Task B4
    await logResult('Email Notifications', '⏳', 'Test implementation pending', false);
  } catch (err) {
    await logResult('Email Notifications', '❌', err.message, true);
  }
}

async function runSlackNotificationTest() {
  console.log('\n--- Slack Notification Test ---');
  try {
    // Placeholder: will be implemented in Task B5
    await logResult('Slack Notifications', '⏳', 'Test implementation pending', false);
  } catch (err) {
    await logResult('Slack Notifications', '❌', err.message, true);
  }
}

async function writeResultsFile() {
  const markdown = `# Vault Automation Test Results

**Date:** ${new Date().toISOString()}

| Job | Status | Issue | Fix Needed |
|-----|--------|-------|-----------|
${testResults.map(r => `| ${r.job} | ${r.status} | ${r.issue} | ${r.fixNeeded ? 'Yes' : 'No'} |`).join('\n')}

## Summary

- Total jobs tested: ${testResults.length}
- Passing: ${testResults.filter(r => r.status === '✅').length}
- Failing: ${testResults.filter(r => r.status === '❌').length}
- Pending: ${testResults.filter(r => r.status === '⏳').length}

## Next Steps

${testResults.filter(r => r.fixNeeded).length > 0 ? '1. Fix failing jobs (see issues above)\n2. Re-run harness to verify fixes' : 'All jobs passing. Archive page integration testing can proceed.'}
`;

  fs.writeFileSync(RESULTS_FILE, markdown, 'utf-8');
  console.log(`\nResults written to ${RESULTS_FILE}`);
}

async function runAllTests() {
  console.log('=== Vault Automation Test Harness ===');
  console.log(`Started: ${new Date().toISOString()}\n`);

  await runDailyMonitoringJobTest();
  await runFridayPublishJobTest();
  await runEmailNotificationTest();
  await runSlackNotificationTest();

  await writeResultsFile();

  console.log('\n=== Test Harness Complete ===');
}

// Export for modular test execution (if needed)
export {
  runDailyMonitoringJobTest,
  runFridayPublishJobTest,
  runEmailNotificationTest,
  runSlackNotificationTest,
  runAllTests,
};

// Run tests if executed directly
if (process.argv[1] === __filename || process.argv[1]?.endsWith('test-vault-automation.js')) {
  runAllTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
