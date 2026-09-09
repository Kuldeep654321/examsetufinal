import { EventType } from '@/types';
import crypto from 'crypto';

export interface ExtractionInput {
  title: string;
  bodyText: string;
  sourceUrl: string;
  sourceOrg: string;
  pdfUrl?: string;
}

export interface ExtractionOutput {
  targetExamSlug?: string;
  targetCategory?: string;
  eventType: EventType;
  title: string;
  summary: string;
  startDate: string | null;
  endDate: string | null;
  isExtension: boolean;
  applicationFee: string | null;
  confidenceScore: number;
  reasoning: string;
  extractedFields: Record<string, any>;
}

export class AIExtractionEngine {
  /**
   * Calculate SHA256 content hash for deduplication and diff tracking
   */
  public static hashContent(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  /**
   * Parse Indian date formats (e.g., "16 March 2027", "16.03.2027", "16-03-2027", "16/03/2027") to ISO YYYY-MM-DD
   */
  public static parseIndianDate(dateStr: string): string | null {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim().replace(/(\d+)(st|nd|rd|th)/gi, '$1');

    const months: Record<string, string> = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12',
    };

    // Pattern 1: 16 March 2027 or 16-Mar-2027
    const alphaMatch = cleanStr.match(/(\d{1,2})[\s\-\/]([A-Za-z]+)[\s\-\/,]+(\d{4})/);
    if (alphaMatch) {
      const day = alphaMatch[1].padStart(2, '0');
      const monthStr = alphaMatch[2].toLowerCase();
      const year = alphaMatch[3];
      const month = months[monthStr] || months[monthStr.substring(0, 3)];
      if (month) return `${year}-${month}-${day}`;
    }

    // Pattern 2: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const numMatch = cleanStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (numMatch) {
      const day = numMatch[1].padStart(2, '0');
      const month = numMatch[2].padStart(2, '0');
      const year = numMatch[3];
      if (parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
        return `${year}-${month}-${day}`;
      }
    }

    // Pattern 3: YYYY-MM-DD
    const isoMatch = cleanStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[0];

    return null;
  }

  /**
   * Identify Exam event type with deterministic keyword scoring
   */
  public static classifyEventType(text: string): { eventType: EventType; score: number } {
    const lower = text.toLowerCase();

    if (/extend|extension of last date|last date extended|deadline extended/i.test(lower)) {
      return { eventType: 'registration', score: 0.95 };
    }
    if (/admit card|hall ticket|e-admit card|city intimation|advance intimation of examination city/i.test(lower)) {
      return { eventType: 'admit_card', score: 0.95 };
    }
    if (/result declared|score card|rank list|merit list|marksheet|declared result/i.test(lower)) {
      return { eventType: 'result', score: 0.95 };
    }
    if (/answer key|provisional answer key|response sheet|challenge window/i.test(lower)) {
      return { eventType: 'answer_key', score: 0.92 };
    }
    if (/correction window|edit window|application correction/i.test(lower)) {
      return { eventType: 'correction_window', score: 0.90 };
    }
    if (/counselling|seat allotment|mcc counselling|josaa|csab|choice filling/i.test(lower)) {
      return { eventType: 'counselling', score: 0.92 };
    }
    if (/examination schedule|exam date|time table|date sheet/i.test(lower)) {
      return { eventType: 'exam', score: 0.88 };
    }
    if (/online application|inviting online application|registration opens|apply online/i.test(lower)) {
      return { eventType: 'registration', score: 0.90 };
    }

    return { eventType: 'registration', score: 0.60 };
  }

  /**
   * Structured extraction engine processing raw text and returning validated data
   */
  public static extractStructuredData(input: ExtractionInput): ExtractionOutput {
    const fullText = `${input.title} \n ${input.bodyText}`;
    const { eventType, score: classificationScore } = this.classifyEventType(fullText);

    const isExtension = /extend|extension|revised date/i.test(fullText);

    // Extract Date Ranges
    // Look for patterns like "from 12 January 2027 to 31 January 2027" or "up to 16 March 2027"
    let startDate: string | null = null;
    let endDate: string | null = null;

    const rangeMatch = fullText.match(/(?:from|opens|w\.e\.f\.?)\s+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})\s+(?:to|till|upto|up to|and closes)\s+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/i);
    if (rangeMatch) {
      startDate = this.parseIndianDate(rangeMatch[1]);
      endDate = this.parseIndianDate(rangeMatch[2]);
    }

    // Single deadline pattern: "up to 16 March 2027" / "last date is 16.03.2027"
    if (!endDate) {
      const deadlineMatch = fullText.match(/(?:up to|upto|last date|deadline|extended to|till|closes)\s+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/i);
      if (deadlineMatch) {
        endDate = this.parseIndianDate(deadlineMatch[1]);
      }
    }

    // Extract Application Fees
    let applicationFee: string | null = null;
    const feeMatch = fullText.match(/(?:fee|application fee|fees)[\s:]+(?:₹|rs\.?|inr)?\s*([0-9]+(?:\s*\/\-\s*|\s*inr|\s*rupees)?)/i);
    if (feeMatch) {
      applicationFee = `₹${feeMatch[1].replace(/[^0-9]/g, '')}`;
    }

    // Determine target exam slug
    let targetExamSlug = '';
    if (/neet/i.test(fullText)) targetExamSlug = 'neet-ug-2027';
    else if (/gate/i.test(fullText)) targetExamSlug = 'gate-2027';
    else if (/rrb|railway/i.test(fullText)) targetExamSlug = 'rrb-ntpc-2027';
    else if (/sbi/i.test(fullText)) targetExamSlug = 'sbi-po-2027';
    else if (/rbi/i.test(fullText)) targetExamSlug = 'rbi-grade-b-2027';
    else if (/jee\s*(?:main)?/i.test(fullText)) targetExamSlug = 'jee-main-2027';
    else if (/upsc|civil services/i.test(fullText)) targetExamSlug = 'upsc-cse-2027';
    else if (/ssc|cgl/i.test(fullText)) targetExamSlug = 'ssc-cgl-2027';
    else if (/cbse.*12|class\s*12.*cbse/i.test(fullText)) targetExamSlug = 'cbse-class-12-board-2027';
    else if (/cbse.*10|class\s*10.*cbse/i.test(fullText)) targetExamSlug = 'cbse-class-10-board-2027';
    else if (/mpbse|mp board.*12/i.test(fullText)) targetExamSlug = 'mp-board-12th-hssc-2027';
    else if (/mppsc|madhya pradesh psc/i.test(fullText)) targetExamSlug = 'mppsc-state-services-2027';
    else if (/cuet/i.test(fullText)) targetExamSlug = 'cuet-ug-2027';
    else if (/clat/i.test(fullText)) targetExamSlug = 'clat-ug-2027';
    else if (/cat/i.test(fullText)) targetExamSlug = 'cat-2027';
    else if (/ibps/i.test(fullText)) targetExamSlug = 'ibps-po-2027';

    // Calculate Confidence Score
    let confidence = classificationScore;
    if (targetExamSlug) confidence += 0.05;
    if (endDate) confidence += 0.05;
    if (startDate && endDate && startDate > endDate) {
      // Invalidation penalty if dates conflict
      confidence -= 0.30;
    }

    // Clamp between 0.10 and 0.99
    confidence = Math.min(0.98, Math.max(0.20, Number(confidence.toFixed(2))));

    const summary = input.bodyText.length > 250
      ? `${input.bodyText.substring(0, 247)}...`
      : input.bodyText || input.title;

    return {
      targetExamSlug: targetExamSlug || undefined,
      eventType,
      title: input.title.trim(),
      summary: summary.trim(),
      startDate,
      endDate,
      isExtension,
      applicationFee,
      confidenceScore: confidence,
      reasoning: `Extracted via verified pattern matcher from ${input.sourceOrg} with event classification confidence ${classificationScore}.`,
      extractedFields: {
        rawTitle: input.title,
        extractedEndDate: endDate,
        extractedStartDate: startDate,
        isExtensionDetected: isExtension,
        detectedSlug: targetExamSlug,
      }
    };
  }
}
