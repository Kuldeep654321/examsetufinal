import { describe, it, expect } from 'vitest';
import { ChangeDetector } from '../src/lib/workers/change-detector';
import { ExtractedExamUpdate } from '../src/lib/sources/types';

describe('ChangeDetector & Diff Engine', () => {
  it('should detect when an exam deadline is extended to a new date', async () => {
    const extractedUpdate: ExtractedExamUpdate = {
      targetExamSlug: 'neet-ug-2027',
      eventType: 'registration',
      title: 'Public Notice: Second Extension of Date for NEET UG 2027',
      summary: 'Deadline extended to 24 March 2027',
      endDate: '2027-03-24',
      isExtension: true,
      confidence: 0.95,
      reasoning: 'Verified press release',
    };

    const diff = await ChangeDetector.detectExamEventDiff(extractedUpdate);
    expect(diff.hasChanges).toBe(true);
    expect(diff.isBreakingChange).toBe(true);
    expect(diff.proposedChanges.end_date).toBe('2027-03-24');
    expect(diff.diffSummary.length).toBeGreaterThan(0);
    expect(diff.diffSummary[0].field).toBe('End Date / Deadline');
  });

  it('should return no changes when dates are identical to current database records', async () => {
    const extractedUpdate: ExtractedExamUpdate = {
      targetExamSlug: 'clat-ug-2027',
      eventType: 'registration',
      title: 'Regular Notice',
      summary: 'Existing dates unchanged',
      endDate: '2026-10-31', // Same as current database date for CLAT UG
      isExtension: false,
      confidence: 0.90,
      reasoning: 'Normal check',
    };

    const diff = await ChangeDetector.detectExamEventDiff(extractedUpdate);
    expect(diff.hasChanges).toBe(false);
  });
});
