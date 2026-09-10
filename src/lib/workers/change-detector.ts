import { query } from '@/lib/db';
import { ExtractedExamUpdate } from '@/lib/sources/types';

export interface DiffResult {
  hasChanges: boolean;
  targetExamId?: string;
  targetEventId?: string;
  proposedChanges: Record<string, any>;
  diffSummary: {
    field: string;
    oldValue: any;
    newValue: any;
    isChange: boolean;
  }[];
  isBreakingChange: boolean;
}

function normalizeDate(d: any): string | null {
  if (!d) return null;

  if (d instanceof Date) {
    const value = new Date(d.getTime());
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (!trimmed) return null;

    const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}$/);
    if (isoMatch) return trimmed;

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return trimmed.substring(0, 10);
  }

  return null;
}

export class ChangeDetector {
  /**
   * Compare extracted update against database exam events
   */
  public static async detectExamEventDiff(
    extracted: ExtractedExamUpdate
  ): Promise<DiffResult> {
    if (!extracted.targetExamSlug) {
      return {
        hasChanges: false,
        proposedChanges: {},
        diffSummary: [],
        isBreakingChange: false,
      };
    }

    // Find exam
    const examRes = await query('SELECT id, title FROM exams WHERE slug = $1', [extracted.targetExamSlug]);
    if (examRes.rows.length === 0) {
      return {
        hasChanges: false,
        proposedChanges: {},
        diffSummary: [],
        isBreakingChange: false,
      };
    }

    const examId = examRes.rows[0].id;

    // Find event
    const eventRes = await query(
      `SELECT id, event_type, title, start_date, end_date, is_extended, previous_end_date, status
       FROM exam_events
       WHERE exam_id = $1 AND event_type = $2
       ORDER BY cycle_year DESC LIMIT 1`,
      [examId, extracted.eventType || 'registration']
    );

    const diffSummary: DiffResult['diffSummary'] = [];
    const proposedChanges: Record<string, any> = {};
    let hasChanges = false;
    let isBreakingChange = false;

    if (eventRes.rows.length > 0) {
      const existing = eventRes.rows[0];
      const existingEndDate = normalizeDate(existing.end_date);
      const existingStartDate = normalizeDate(existing.start_date);
      const extractedEndDate = normalizeDate(extracted.endDate);
      const extractedStartDate = normalizeDate(extracted.startDate);

      // Compare End Date
      if (extractedEndDate && extractedEndDate !== existingEndDate) {
        hasChanges = true;
        isBreakingChange = true;
        diffSummary.push({
          field: 'End Date / Deadline',
          oldValue: existingEndDate,
          newValue: extractedEndDate,
          isChange: true,
        });
        proposedChanges.end_date = extractedEndDate;

        if (extracted.isExtension || (existingEndDate && extractedEndDate > existingEndDate)) {
          proposedChanges.is_extended = true;
          proposedChanges.previous_end_date = existingEndDate;
          diffSummary.push({
            field: 'Is Extension',
            oldValue: existing.is_extended,
            newValue: true,
            isChange: true,
          });
        }
      }

      // Compare Start Date
      if (extractedStartDate && extractedStartDate !== existingStartDate) {
        hasChanges = true;
        diffSummary.push({
          field: 'Start Date',
          oldValue: existingStartDate,
          newValue: extractedStartDate,
          isChange: true,
        });
        proposedChanges.start_date = extractedStartDate;
      }

      return {
        hasChanges,
        targetExamId: examId,
        targetEventId: existing.id,
        proposedChanges,
        diffSummary,
        isBreakingChange,
      };
    }

    return {
      hasChanges: true,
      targetExamId: examId,
      proposedChanges: {
        event_type: extracted.eventType,
        title: extracted.title,
        start_date: extracted.startDate,
        end_date: extracted.endDate,
      },
      diffSummary: [
        {
          field: 'New Event Discovered',
          oldValue: null,
          newValue: extracted.title,
          isChange: true,
        },
      ],
      isBreakingChange: true,
    };
  }
}
