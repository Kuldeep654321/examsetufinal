import { query } from '@/lib/db';
import { sourceRegistry } from '@/lib/sources/registry';
import { ChangeDetector } from './change-detector';
import { NotificationDispatcher } from '@/lib/notifications/dispatcher';

export interface PipelineExecutionResult {
  sourcesProcessed: number;
  itemsDetected: number;
  changesFound: number;
  queuedForReview: number;
  autoApplied: number;
  errors: string[];
}

export class IngestionPipeline {
  /**
   * Run full source monitoring, diffing, extraction, review-queueing, and notification
   */
  public static async runFullSync(): Promise<PipelineExecutionResult> {
    const result: PipelineExecutionResult = {
      sourcesProcessed: 0,
      itemsDetected: 0,
      changesFound: 0,
      queuedForReview: 0,
      autoApplied: 0,
      errors: [],
    };

    const sourcesRes = await query('SELECT * FROM sources WHERE is_enabled = true');
    const sources = sourcesRes.rows;

    for (const source of sources) {
      const adapter = sourceRegistry.get(source.adapter_name);
      if (!adapter) {
        result.errors.push(`Adapter '${source.adapter_name}' not found.`);
        continue;
      }

      result.sourcesProcessed++;
      const fetchResult = await adapter.fetchAnnouncements();

      // Log fetch
      await query(
        `INSERT INTO source_fetch_logs (source_id, page_url, status_code, response_time_ms, content_changed, items_detected, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          source.id,
          source.base_url,
          fetchResult.statusCode,
          fetchResult.responseTimeMs,
          fetchResult.items.length > 0,
          fetchResult.items.length,
          fetchResult.errorMessage || null,
        ]
      );

      // Update source health
      await query(
        `UPDATE sources SET
           health_status = $1,
           response_time_ms = $2,
           last_successful_fetch = CASE WHEN $3 = true THEN NOW() ELSE last_successful_fetch END,
           last_failed_fetch = CASE WHEN $3 = false THEN NOW() ELSE last_failed_fetch END,
           failure_count = CASE WHEN $3 = true THEN 0 ELSE failure_count + 1 END,
           error_message = $4,
           updated_at = NOW()
         WHERE id = $5`,
        [
          fetchResult.success ? 'healthy' : 'failed',
          fetchResult.responseTimeMs,
          fetchResult.success,
          fetchResult.errorMessage || null,
          source.id,
        ]
      );

      if (!fetchResult.success) continue;

      result.itemsDetected += fetchResult.items.length;

      for (const item of fetchResult.items) {
        const parsed = await adapter.parseDocument(item);
        if (!parsed) continue;

        const diff = await ChangeDetector.detectExamEventDiff(parsed);

        if (diff.hasChanges) {
          result.changesFound++;

          // Check if already in review queue to avoid duplicate review items
          const existingQueue = await query(
            'SELECT id FROM review_queue WHERE document_url = $1 AND review_status = $2',
            [item.url, 'pending']
          );

          if (existingQueue.rows.length === 0) {
            // High confidence (>=0.95) & non-breaking can be auto-approved, otherwise route to Review Queue
            const shouldAutoApply = parsed.confidence >= 0.95 && !diff.isBreakingChange;

            if (shouldAutoApply && diff.targetEventId) {
              // Auto-apply update
              if (diff.proposedChanges.end_date) {
                await query(
                  `UPDATE exam_events SET end_date = $1, is_extended = $2, previous_end_date = $3, last_verified_at = NOW()
                   WHERE id = $4`,
                  [
                    diff.proposedChanges.end_date,
                    diff.proposedChanges.is_extended || false,
                    diff.proposedChanges.previous_end_date || null,
                    diff.targetEventId,
                  ]
                );
              }
              result.autoApplied++;
            } else {
              // Add to Review Queue for human administrator verification
              await query(
                `INSERT INTO review_queue (
                  source_id, document_url, document_title, target_entity_type, target_entity_id,
                  extracted_data, proposed_changes, diff_summary, ai_confidence, ai_reasoning, review_status
                ) VALUES ($1, $2, $3, 'exam_event', $4, $5, $6, $7, $8, $9, 'pending')`,
                [
                  source.id,
                  item.url,
                  item.title,
                  diff.targetExamId || null,
                  JSON.stringify(parsed),
                  JSON.stringify(diff.proposedChanges),
                  JSON.stringify(diff.diffSummary),
                  parsed.confidence,
                  parsed.reasoning,
                ]
              );
              result.queuedForReview++;
            }

            // If breaking or extension, dispatch student notifications
            if (diff.isBreakingChange && diff.targetExamId) {
              await NotificationDispatcher.dispatchToRelevantStudents({
                title: `Important Update: ${parsed.title}`,
                message: parsed.summary,
                link: `/exams/${parsed.targetExamSlug || ''}`,
                type: 'deadline',
                targetExamId: diff.targetExamId,
              });
            }
          }
        }
      }
    }

    return result;
  }
}
