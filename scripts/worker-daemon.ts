import { IngestionPipeline } from '../src/lib/workers/pipeline';

const INTERVAL_MINUTES = parseInt(process.env.WORKER_INTERVAL_MINUTES || '15', 10);
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

console.log(`🤖 ExamSetu Continuous Ingestion Daemon Started`);
console.log(`⏱️ Configured Check Interval: Every ${INTERVAL_MINUTES} minutes`);

async function runDaemonCycle() {
  console.log(`\n[${new Date().toISOString()}] 🔄 Running Scheduled Source Monitoring Cycle...`);
  try {
    const res = await IngestionPipeline.runFullSync();
    console.log(`✅ Cycle Complete: ${res.sourcesProcessed} sources checked, ${res.itemsDetected} items detected, ${res.queuedForReview} queued for review.`);
  } catch (err: any) {
    console.error(`❌ Daemon cycle error:`, err.message);
  }
}

// Initial cycle on startup
runDaemonCycle();

// Set interval for continuous execution
setInterval(runDaemonCycle, INTERVAL_MS);
