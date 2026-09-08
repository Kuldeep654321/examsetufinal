import { describe, it, expect } from 'vitest';
import { AIExtractionEngine } from '../src/lib/ai/extractor';

describe('AIExtractionEngine & NLP Structuring', () => {
  it('should parse various Indian date formats reliably', () => {
    expect(AIExtractionEngine.parseIndianDate('16 March 2027')).toBe('2027-03-16');
    expect(AIExtractionEngine.parseIndianDate('16-Mar-2027')).toBe('2027-03-16');
    expect(AIExtractionEngine.parseIndianDate('16/03/2027')).toBe('2027-03-16');
    expect(AIExtractionEngine.parseIndianDate('05-02-2027')).toBe('2027-02-05');
    expect(AIExtractionEngine.parseIndianDate('2027-05-03')).toBe('2027-05-03');
    expect(AIExtractionEngine.parseIndianDate('invalid date')).toBeNull();
  });

  it('should extract date ranges without hallucination from official NTA announcement text', () => {
    const rawText = 'Online applications will be accepted from 12 January 2027 to 31 January 2027.';
    const output = AIExtractionEngine.extractStructuredData({
      title: 'NEET UG 2027 Application Notification',
      bodyText: rawText,
      sourceUrl: 'https://exams.nta.ac.in/NEET/',
      sourceOrg: 'NTA',
    });

    expect(output.eventType).toBe('registration');
    expect(output.startDate).toBe('2027-01-12');
    expect(output.endDate).toBe('2027-01-31');
    expect(output.targetExamSlug).toBe('neet-ug-2027');
    expect(output.confidenceScore).toBeGreaterThanOrEqual(0.85);
  });

  it('should detect extension notices and set isExtension flag true', () => {
    const notice = 'Public Notice: Extension of Last Date for NEET UG 2027 up to 16 March 2027.';
    const output = AIExtractionEngine.extractStructuredData({
      title: 'Extension of Last Date',
      bodyText: notice,
      sourceUrl: 'https://exams.nta.ac.in/NEET/notice.pdf',
      sourceOrg: 'NTA',
    });

    expect(output.isExtension).toBe(true);
    expect(output.endDate).toBe('2027-03-16');
  });

  it('should properly calculate SHA256 content hashes', () => {
    const hash1 = AIExtractionEngine.hashContent('Sample notice content 2027');
    const hash2 = AIExtractionEngine.hashContent('Sample notice content 2027');
    const hash3 = AIExtractionEngine.hashContent('Different notice content 2027');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });
});
