# ExamSetu (examsetu.in) - System Architecture & Technical Implementation Plan
**National Exam & Opportunity Intelligence Platform for Indian Students**
**GitHub Repository:** `Kuldeep654321/examsetu` | **Production Domain:** `examsetu.in`

---

## 1. System Architecture Overview

```
                                    ┌────────────────────────┐
                                    │    Cloudflare CDN      │
                                    │  (SSL, Caching, WAF)   │
                                    └───────────┬────────────┘
                                                │
                                    ┌───────────▼────────────┐
                                    │    Next.js 14 App      │
                                    │  (SSR, CSR, API Layer) │
                                    └─────┬──────────────┬───┘
                                          │              │
                       ┌──────────────────┘              └──────────────────┐
                       ▼                                                    ▼
         ┌───────────────────────────┐                        ┌───────────────────────────┐
         │ PostgreSQL 17 (Primary)   │                        │   Redis 7 (Queue & Cache) │
         │ - Normalized Schema       │                        │ - BullMQ Job Broker       │
         │ - Full-Text Search Vector │                        │ - Session & Rate Limiting │
         │ - JSONB Structured Storage│                        │ - Fast Key-Value Store    │
         └─────────────▲─────────────┘                        └─────────────▲─────────────┘
                       │                                                    │
                       └──────────────────┬─────────────────────────────────┘
                                          │
                            ┌─────────────▼─────────────┐
                            │  Background Worker Engine  │
                            └─────────────┬─────────────┘
                                          │
       ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
       ▼                  ▼               ▼               ▼                  ▼
┌──────────────┐   ┌──────────────┐┌──────────────┐┌──────────────┐   ┌──────────────┐
│ Official     │   │ Change       ││ AI Structured││ Review Queue │   │ Notification │
│ Source       │──▶│ Detection    ││ Extraction & ││ & Admin      │──▶│ Dispatcher   │
│ Adapters     │   │ Engine (Diff)││ Validation   ││ Approval     │   │ (In-App/Push)│
└──────────────┘   └──────────────┘└──────────────┘└──────────────┘   └──────────────┘
```

---

## 2. Folder Structure

```
/home/user/examsetu/
├── src/
│   ├── app/                                 # Next.js App Router
│   │   ├── (auth)/login, register           # Auth pages with validation
│   │   ├── exams/ & exams/[slug]/           # SEO Exam Directory & Event Detail pages
│   │   ├── opportunities/ & [slug]/         # Scholarships & Jobs Directory
│   │   ├── dashboard/                       # Student Portal (Tracker, Saved, Alerts, Profile)
│   │   ├── admin/                           # Admin Command Center (Queue, Sources, Audit)
│   │   ├── search/                          # Typo-Tolerant Search Engine
│   │   ├── api/                             # RESTful Endpoints & Worker Triggers
│   │   ├── layout.tsx & globals.css         # Shell Layout & Theme
│   │   ├── sitemap.ts & robots.ts           # Dynamic SEO Engines
│   │   └── page.tsx                         # Intelligence Homepage
│   ├── components/                          # UI & Domain Components
│   │   ├── ui/                              # Atomic UI components
│   │   ├── layout/                          # Navbar, Footer, Breadcrumbs, Sidebars
│   │   ├── exams/                           # ExamCard, EventTimeline, DiffBadge, PDFViewer
│   │   ├── opportunities/                   # OppCard, EligibilityWidget, BenefitsList
│   │   ├── dashboard/                       # TodayFeed, TrackerCard, DeadlineCountdown
│   │   ├── admin/                           # ReviewItem, DiffViewer, SourceStatusPill, LogViewer
│   │   └── search/                          # SearchBar, QuickFilters, FacetChips
│   ├── lib/
│   │   ├── db/                              # Database pool, schema, queries, seed data
│   │   ├── auth/                            # JWT, Passwords, RBAC guards
│   │   ├── ai/                              # Structured Extraction & Validation Engine
│   │   ├── sources/                         # Source Registry & Adapters (NTA, UPSC, SSC, CBSE...)
│   │   ├── workers/                         # Fetcher, Diff Engine, Review Pipeline, Scheduler
│   │   ├── notifications/                   # Notification Center & Dispatchers
│   │   ├── search/                          # Fast typo-tolerant search engine
│   │   └── seo/                             # JSON-LD Schema.org generators
│   └── types/                               # TypeScript domain definitions
├── scripts/                                 # DB Init, Seeder, Standalone Worker
├── tests/                                   # Vitest Unit & Integration Suites
├── Dockerfile & docker-compose.yml
└── package.json
```

---

## 3. Database ERD & Schema Design

### Core Tables:
1. **`users` & `profiles`**: Student & Admin credentials, education profiles (Class, Stream, State, Target Exams).
2. **`organizations` & `states`**: Conducting bodies (NTA, UPSC, SSC, CBSE, MPBSE, MPPSC, etc.) with domain verification.
3. **`categories`**: Hierarchical categories (Engineering, Medical, Civil Services, State Boards, Scholarships, etc.).
4. **`exams`**: Base exam entity with eligibility, syllabus link, frequency, pattern, level, and verification status.
5. **`exam_events`**: Event-driven timeline entries (Registration, Correction, Admit Card, Exam, Answer Key, Result, Counselling).
6. **`exam_updates`**: Change logs preserving `old_value`, `new_value`, source citation, diff reason, breaking status.
7. **`opportunities`**: Scholarships, Fellowships, Internships, Jobs with eligibility, financial aid, and deadline extension tracking.
8. **`sources`, `source_pages`, `source_documents`, `source_fetch_logs`**: Source-monitoring infrastructure tracking health status, HTTP codes, content hashes, layout changes, and document parsing.
9. **`review_queue`**: Human-in-the-loop review queue for AI-extracted updates with confidence scores and diff views.
10. **`application_tracker`**: Private student tracking pipeline with status stages and notes.
11. **`saved_exams` & `saved_opportunities`**: Student bookmarks with reminder flags.
12. **`notifications`**: Real-time notifications for deadline alerts, admit cards, and results.
13. **`audit_logs`**: Comprehensive admin and system activity audit trail.

---

## 4. API Design Specification

- `POST /api/auth/register` - Create student/verifier account with educational preferences.
- `POST /api/auth/login` - Authenticate user & set secure HTTP-only JWT cookie.
- `GET /api/auth/me` & `PUT /api/auth/me` - Profile management.
- `POST /api/auth/logout` - Clear auth session.
- `GET /api/exams` - Filterable query (class, state, stream, category, status, search).
- `GET /api/exams/:slug` - Single exam detail with all events, updates, official links, FAQs.
- `GET /api/opportunities` - Filterable opportunities (scholarships, jobs, internships, etc.).
- `GET /api/opportunities/:slug` - Opportunity detail with eligibility & source attribution.
- `GET /api/dashboard` - Personalized student dashboard feed & deadlines.
- `GET, POST, PUT, DELETE /api/tracker` - Manage private student application pipeline.
- `GET, POST, DELETE /api/tracker/saved` - Bookmark management.
- `GET, PATCH /api/notifications` - In-app notification center.
- `GET /api/search` - Instant typo-tolerant search across all entities.
- `GET /api/admin/overview` - Platform metrics, health breakdown, pending items.
- `GET, POST /api/admin/review-queue` - Review queue approval/rejection/merging.
- `GET, POST, PATCH /api/admin/sources` - Source registry and health monitor.
- `POST /api/admin/manual-update` - Manual verified update publication.
- `GET /api/admin/audit-logs` - Audit trail inspection.
- `POST /api/worker/run` - Trigger automated crawl & extraction sync.

---

## 5. Authentication & Security Model
- Standard JWT with HTTP-only, SameSite=Strict cookies.
- Argon2 / Bcrypt password hashing.
- Role-based Access Control (`student`, `verifier`, `admin`).
- Rate limiting on public and auth endpoints.
- Parameterized SQL execution for zero SQL injection.
- Strict input validation via Zod schemas.

---

## 6. Source-Monitoring & Extraction Pipeline
- Official sources only: NTA (`nta.ac.in`), UPSC (`upsc.gov.in`), SSC (`ssc.gov.in`), CBSE (`cbse.gov.in`), MPBSE (`mpbse.nic.in`), MPPSC (`mppsc.mp.gov.in`), IBPS (`ibps.in`), National Scholarship Portal (`scholarships.gov.in`).
- Organization-specific adapters handling bespoke DOM structures and PDF announcement feeds.
- SHA-256 content hashing to avoid redundant processing.
- AI Structured Extraction with strict schema enforcement (never hallucinating missing dates).
- Sanity validation: low-confidence items (< 0.75) route to Admin Review Queue.

---

## 7. SEO Architecture
- Dynamic metadata with Open Graph & Twitter cards for every exam and opportunity.
- JSON-LD structured data (Schema.org `EducationalOccupationalCredential`, `Event`, `Scholarship`).
- Breadcrumbs markup, dynamic `sitemap.xml`, and `robots.txt`.
- Canonical URLs targeting queries like "NEET UG 2027 registration date", "MP Board 12th result date".
