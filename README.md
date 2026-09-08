# ExamSetu (परीक्षा सेतु) — National Exam & Opportunity Intelligence Platform

[![Production Status](https://img.shields.io/badge/Status-Production%20Ready-emerald)](https://examsetu.in)
[![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.0-blue)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.0%20Queue-red)](https://redis.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**GitHub Repository:** `Kuldeep654321/examsetu`  
**Production Domain:** `examsetu.in`

---

## 🏛️ 1. Product Vision

**ExamSetu** is an Indian **Exam & Opportunity Intelligence Platform** designed to aggregate, verify, structure, and continuously monitor examinations and student opportunities direct from official conducting bodies across India.

### Comprehensive Coverage:
- **School & Higher Secondary Boards:** CBSE (Class 10 & 12), MP Board (MPBSE 10th & 12th), ICSE/ISC, UPMSP, State Boards, NIOS.
- **National Entrance Examinations:** Medical (NEET UG/PG), Engineering (JEE Main, JEE Advanced), University (CUET UG/PG), Law (CLAT UG/PG), Management (CAT IIM).
- **Civil Services & State PSC:** UPSC CSE (IAS, IPS, IFS), MPPSC State Services Exam (Madhya Pradesh), State PSCs.
- **Staff Selection & Banking:** SSC (CGL, CHSL, MTS), IBPS (PO, Clerk), SBI PO, Railways (RRB NTPC, Group D), Teaching (CTET).
- **Government Scholarships & Opportunities:** National Scholarship Portal (NSP), DST INSPIRE SHE, AICTE Pragati, ISRO YUVIKA, DRDO Apprenticeships, Google Summer of Code (GSoC).

---

## 🎯 2. Core Pillars & Anti-Hallucination Guarantee

1. **100% Official Source Truth:** We only accept notices from verified official domains (e.g. `nta.ac.in`, `upsc.gov.in`, `ssc.gov.in`, `cbse.gov.in`, `mpbse.nic.in`, `scholarships.gov.in`).
2. **Explicit Unannounced Status:** If conducting authorities have not officially published a date, the platform explicitly displays **"Not officially announced yet"** rather than speculating.
3. **Change Detection & Historical Versioning:** When deadlines extend (e.g. NEET UG application extended from 09 March to 16 March), ExamSetu maintains the previous date and documents the change reason.
4. **Human-in-the-Loop Review Queue:** AI-extracted notifications and low-confidence items are routed to the verification queue before being published live.
5. **Zero Spam & Pure Privacy:** No clickbait ads, no fake urgency timers, and zero exposure of private student application numbers.

---

## 🏗️ 3. Architecture & Data Pipeline

```
Official Authority (NTA / UPSC / SSC / CBSE / MPBSE / MPPSC / IBPS / NSP)
                       │
             [ Fetcher Engine ]
                       │
          [ SHA-256 Content Hasher ]
                       │
       [ PDF / Document / HTML Parser ]
                       │
    [ AI Structured Extraction (JSON Schema) ]
                       │
         [ Schema & Date Sanity Check ]
                       │
         [ Change Detector (Diff Engine) ]
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
  [ Review Queue ]          [ Auto-Publish ]
 (Human Verification)      (Confidence >= 95%)
          │                         │
          └────────────┬────────────┘
                       │
        [ Normalized PostgreSQL 17 ]
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   [ Next.js SSR ] [ Redis ] [ Notification Dispatcher ]
```

---

## 🗄️ 4. Normalized Database Schema

- `users` & `profiles` (Student & Admin RBAC, class, board, stream, state)
- `organizations` (Conducting bodies with verified official domains)
- `exams` (SEO-friendly slugs, eligibility, syllabus links, exam patterns)
- `exam_events` (Event-driven lifecycle: Registration, Correction, Admit Card, Exam, Answer Key, Result, Counselling)
- `exam_updates` (Audit log of official notices with `old_value` and `new_value`)
- `opportunities` (Scholarships, internships, fellowships, financial aid)
- `sources` & `source_fetch_logs` (Health monitor, response latency, layout check)
- `review_queue` (AI confidence score, diff summary, admin approval workflow)
- `application_tracker` (Encrypted, private student pipeline)
- `saved_exams` & `saved_opportunities` (Student bookmarks)
- `notifications` (Real-time in-app and dispatch queue)
- `audit_logs` (Compliance and security log)

---

## 🚀 5. Quick Start & Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 17
- Redis 7

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Kuldeep654321/examsetu.git
cd examsetu
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure credentials:
```bash
cp .env.example .env
```

### 3. Initialize Database & Run Seed Data
```bash
npm run db:init
```

### 4. Run Source Monitoring Worker
```bash
npm run worker:run
```

### 5. Run Automated Test Suites
```bash
npm test
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 6. Docker Deployment

To launch the complete production stack (PostgreSQL + Redis + Next.js Web App):

```bash
docker-compose up --build -d
```

---

## 🔐 7. Default Credentials (Pre-Seeded)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@examsetu.in` | `ExamAdmin@2026` | Full Control, Source Management, Worker Trigger, Audit Logs |
| **Verifier** | `verifier@examsetu.in` | `Verifier@2026` | Review Queue Verification, Diff Inspection, Manual Notice Publishing |
| **Student** | `student@examsetu.in` | `Student@1234` | Personalized Dashboard, Application Tracker, Bookmarks, Notification Center |

---

## 🛡️ 8. Security & Compliance

- **Password Hashing:** Bcrypt with 10 salt rounds.
- **Session Tokens:** Secure, HTTP-only, SameSite=Lax JWT cookies.
- **SQL Injection Prevention:** Parameterized SQL queries for all database transactions.
- **Input Validation:** Strict runtime Zod schema parsing across all API endpoints.
- **Private Data Protection:** Student application numbers and personal notes are isolated to the authenticated user.

---

## 📜 9. License

This project is licensed under the MIT License. Built for students across India.
