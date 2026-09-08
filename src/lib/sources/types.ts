import { EventType, SourceType } from '@/types';

export interface RawSourceItem {
  title: string;
  url: string;
  publicationDate?: string;
  rawHtml?: string;
  pdfUrl?: string;
  categoryTag?: string;
  contentHash: string;
}

export interface AdapterFetchResult {
  success: boolean;
  statusCode: number;
  responseTimeMs: number;
  items: RawSourceItem[];
  errorMessage?: string;
  layoutChanged?: boolean;
}

export interface ExtractedExamUpdate {
  targetExamSlug?: string;
  eventType?: EventType;
  title: string;
  summary: string;
  startDate?: string | null;
  endDate?: string | null;
  isExtension?: boolean;
  applicationFee?: string;
  officialDocUrl?: string;
  confidence: number;
  reasoning: string;
}

export abstract class BaseSourceAdapter {
  abstract readonly adapterName: string;
  abstract readonly defaultBaseUrl: string;
  abstract readonly organizationSlug: string;
  abstract readonly sourceType: SourceType;

  /**
   * Fetch announcements / notices from the official authority
   */
  abstract fetchAnnouncements(): Promise<AdapterFetchResult>;

  /**
   * Parse single document or announcement text
   */
  abstract parseDocument(item: RawSourceItem): Promise<ExtractedExamUpdate | null>;
}
