export type UserRole = 'student' | 'verifier' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  class_level?: string; // e.g. "10", "12", "Undergraduate", "Graduate", "Diploma"
  board?: string;       // e.g. "CBSE", "ICSE", "MPBSE", "State Board"
  state?: string;       // e.g. "Madhya Pradesh", "Delhi", "Uttar Pradesh", "Maharashtra"
  stream?: string;      // e.g. "PCB", "PCM", "Commerce", "Arts/Humanities", "General"
  subjects?: string[];
  target_exams?: string[]; // e.g. ["NEET", "JEE Main", "CUET", "MP Board 12th"]
  career_interests?: string[];
  phone_number?: string;
  notification_preferences?: {
    email: boolean;
    in_app: boolean;
    web_push: boolean;
    deadline_reminders: boolean;
    admit_card_alerts: boolean;
    result_alerts: boolean;
  };
  created_at: string;
  updated_at: string;
}

export type OrgType = 'national_testing' | 'board' | 'commission' | 'recruitment' | 'university' | 'scholarship_body' | 'defence';

export interface Organization {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  official_domain: string;
  description: string;
  logo_url?: string;
  state_id?: string;
  org_type: OrgType;
  official_portal_url: string;
  helpline_number?: string;
  contact_email?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface State {
  id: string;
  code: string;
  name: string;
  type: 'state' | 'ut';
  capital?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
}

export type EventType =
  | 'registration'
  | 'correction_window'
  | 'admit_card'
  | 'exam'
  | 'answer_key'
  | 'result'
  | 'counselling'
  | 'admission';

export type EventStatus =
  | 'upcoming'
  | 'open'
  | 'closing_soon'
  | 'closed'
  | 'completed'
  | 'unannounced'
  | 'delayed';

export interface ExamEvent {
  id: string;
  exam_id: string;
  cycle_year: number;
  event_type: EventType;
  title: string;
  start_date: string | null;
  end_date: string | null;
  is_extended: boolean;
  previous_end_date: string | null;
  status: EventStatus;
  official_source_url: string;
  notification_doc_url?: string;
  notes?: string;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

export type UpdateType =
  | 'date_extended'
  | 'admit_card_out'
  | 'result_declared'
  | 'syllabus_updated'
  | 'pattern_changed'
  | 'new_cycle'
  | 'correction_opened'
  | 'general';

export interface ExamUpdate {
  id: string;
  exam_id: string;
  event_id?: string;
  title: string;
  summary: string;
  old_value?: string;
  new_value?: string;
  update_type: UpdateType;
  official_source_url: string;
  official_doc_ref?: string;
  is_breaking: boolean;
  verified_by_user_id?: string;
  published_at: string;
  created_at: string;
}

export interface ExamFAQ {
  question: string;
  answer: string;
}

export interface SelectionStage {
  stage: number;
  name: string;
  type: string; // 'Objective CBT', 'Descriptive Paper', 'Physical Test', 'Interview'
  description: string;
  marks?: number;
  duration?: string;
}

export interface ExamPatternSection {
  name: string;
  questions: number;
  marks: number;
}

export interface ExamPattern {
  mode: string; // "Computer Based Test (CBT)", "Pen and Paper (OMR)", "Hybrid"
  duration_minutes: number;
  total_marks: number;
  negative_marking: string;
  sections: ExamPatternSection[];
}

export interface Exam {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  conducting_org_id: string;
  conducting_org?: Organization;
  state_id?: string;
  state?: State;
  category_id: string;
  category?: Category;
  level: string; // "National", "State", "University"
  stream_eligibility: string[]; // ["PCB", "PCM", "Commerce", "Arts/Humanities", "Any"]
  min_age?: number;
  max_age?: number;
  age_relaxation?: Record<string, string>;
  eligibility_criteria: string;
  exam_frequency: string; // "Once a year", "Twice a year"
  official_website_url: string;
  registration_url?: string;
  syllabus_url?: string;
  exam_pattern?: ExamPattern;
  important_documents?: string[];
  faqs?: ExamFAQ[];
  overview_article?: string;
  selection_process?: SelectionStage[];
  career_scope?: string;
  preparation_tips?: {
    strategy?: string[];
    books?: { subject: string; book: string; author?: string }[];
    key_topics?: string[];
  };
  cutoffs_info?: {
    year?: number;
    categories?: { category: string; cutoff: string }[];
    notes?: string;
  };
  is_active: boolean;
  is_featured: boolean;
  last_verified_at: string;
  events?: ExamEvent[];
  updates?: ExamUpdate[];
  created_at: string;
  updated_at: string;
}

export type OpportunityType =
  | 'scholarship'
  | 'internship'
  | 'job'
  | 'fellowship'
  | 'olympiad'
  | 'competition'
  | 'apprenticeship'
  | 'certification'
  | 'govt_scheme'
  | 'entrance_opp';

export type OppStatus = 'upcoming' | 'open' | 'closing_soon' | 'closed' | 'announced';

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  org_id: string;
  org?: Organization;
  opp_type: OpportunityType;
  description: string;
  eligibility: string;
  qualification: string;
  min_age?: number;
  max_age?: number;
  state_id?: string;
  state?: State;
  location?: string;
  stream?: string[];
  application_start: string | null;
  application_deadline: string | null;
  is_deadline_extended: boolean;
  previous_deadline?: string | null;
  benefits: string;
  financial_aid_amount?: string;
  vacancies_count?: string;
  salary_range?: string;
  stipend_amount?: string;
  department?: string;
  role_designation?: string;
  application_process: string;
  official_source_url: string;
  official_portal_link?: string;
  documents_required: string[];
  status: OppStatus;
  last_verified_at: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyMaterial {
  id: string;
  exam_id?: string;
  title: string;
  resource_type: 'syllabus_pdf' | 'pyq_paper' | 'answer_key_pdf' | 'model_paper';
  year?: number;
  file_url: string;
  file_size_kb?: number;
  is_official: boolean;
  description?: string;
  created_at: string;
}

export interface DailyGKCapsule {
  id: string;
  title: string;
  summary: string;
  category: string;
  relevant_exams: string[];
  key_takeaways: string[];
  source_url?: string;
  published_date: string;
  created_at: string;
}

export type SourceType = 'official_api' | 'official_feed' | 'official_html' | 'official_pdf';
export type SourceHealth = 'healthy' | 'layout_changed' | 'failed' | 'degraded';

export interface Source {
  id: string;
  name: string;
  org_id: string;
  org?: Organization;
  official_domain: string;
  base_url: string;
  source_type: SourceType;
  adapter_name: string;
  check_interval_minutes: number;
  is_enabled: boolean;
  health_status: SourceHealth;
  last_successful_fetch: string | null;
  last_failed_fetch: string | null;
  failure_count: number;
  response_time_ms?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SourceFetchLog {
  id: string;
  source_id: string;
  source_name?: string;
  page_url: string;
  status_code: number;
  response_time_ms: number;
  content_changed: boolean;
  items_detected: number;
  error_message?: string;
  fetched_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'merged' | 'edited';

export interface ReviewQueueItem {
  id: string;
  source_id: string;
  source?: Source;
  document_url: string;
  document_title: string;
  target_entity_type: 'exam' | 'exam_event' | 'opportunity' | 'exam_update';
  target_entity_id?: string;
  target_entity_name?: string;
  extracted_data: {
    event_type?: EventType;
    title?: string;
    start_date?: string | null;
    end_date?: string | null;
    is_extension?: boolean;
    fees?: string;
    eligibility_note?: string;
    summary?: string;
    official_link?: string;
  };
  proposed_changes: Record<string, any>;
  diff_summary: {
    field: string;
    old_value: any;
    new_value: any;
    is_change: boolean;
  }[];
  ai_confidence: number;
  ai_reasoning: string;
  review_status: ReviewStatus;
  reviewed_by?: string;
  review_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export type TrackerStatus =
  | 'interested'
  | 'will_apply'
  | 'applied'
  | 'admit_card_received'
  | 'exam_completed'
  | 'result_available';

export interface ApplicationTrackerItem {
  id: string;
  user_id: string;
  target_type: 'exam' | 'opportunity';
  target_id: string;
  target_title?: string;
  target_slug?: string;
  target_org?: string;
  status: TrackerStatus;
  application_number?: string;
  roll_number?: string;
  exam_date?: string;
  exam_center?: string;
  private_notes?: string;
  documents_checklist?: { name: string; completed: boolean }[];
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string;
  type: 'exam_alert' | 'deadline' | 'admit_card' | 'result' | 'system' | 'opportunity';
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_state?: Record<string, any>;
  new_state?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface FilterState {
  class_level?: string;
  board?: string;
  state?: string;
  stream?: string;
  category?: string;
  status?: string;
  query?: string;
  level?: string;
}
