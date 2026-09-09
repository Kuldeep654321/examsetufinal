import { describe, it, expect } from 'vitest';
import { ChangeDetector } from '../src/lib/workers/change-detector';
import { ExtractedExamUpdate } from '../src/lib/sources/types';

describe('ChangeDetector & Diff Engine', () => {
  it('should detect when an exam deadline is extended to a new date', async () => {
    const extractedUpdate: ExtractedExamUpdate = {
      targetExamSlug: 'ssc-chsl-2026',
      eventType: 'registration',
      title: 'Corrigendum: Extension of Last Date for SSC CHSL 2026',
      summary: 'Application deadline extended to 15 October 2026',
      endDate: '2026-10-15',
      isExtension: true,
      confidence: 0.95,
      reasoning: 'Verified official corrigendum notice on ssc.gov.in',
    };

    const diff = await ChangeDetector.detectExamEventDiff(extractedUpdate);
    expect(diff.hasChanges).toBe(true);
    expect(diff.isBreakingChange).toBe(true);
    expect(diff.proposedChanges.end_date).toBe('2026-10-15');
    expect(diff.diffSummary.length).toBeGreaterThan(0);
    expect(diff.diffSummary[0].field).toBe('End Date / Deadline');
  });

  it('should return no changes when dates are identical to current database records', async () => {
    const extractedUpdate: ExtractedExamUpdate = {
      targetExamSlug: 'ssc-chsl-2026',
      eventType: 'registration',
      title: 'Regular Notice',
      summary: 'Existing dates unchanged',
      endDate: '2026-10-07', // Same as current official database date for SSC CHSL
      isExtension: false,
      confidence: 0.90,
      reasoning: 'Routine crawler check',
    };

    const diff = await ChangeDetector.detectExamEventDiff(extractedUpdate);
    expect(diff.hasChanges).toBe(false);
  });
});

