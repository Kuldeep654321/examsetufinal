import pool from '../src/lib/db';
import { IngestionPipeline } from '../src/lib/workers/pipeline';

async function main() {
  console.log('⚡ Starting ExamSetu Source Monitoring & Ingestion Pipeline...');
  const start = Date.now();

  try {
    const result = await IngestionPipeline.runFullSync();
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                ExamSetu Worker Ingestion Summary                 ║
╠══════════════════════════════════════════════════════════════════╣
║ Sources Processed:  ${result.sourcesProcessed.toString().padEnd(43)}║
║ Items Detected:     ${result.itemsDetected.toString().padEnd(43)}║
║ Changes Found:      ${result.changesFound.toString().padEnd(43)}║
║ Queued for Review:  ${result.queuedForReview.toString().padEnd(43)}║
║ Auto-Applied:       ${result.autoApplied.toString().padEnd(43)}║
║ Errors:             ${result.errors.length.toString().padEnd(43)}║
║ Time Elapsed:       ${((Date.now() - start) / 1000).toFixed(2)}s                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error('Worker failed:', err);
  } finally {
    await pool.end();
  }
}

main();
