import fs from 'fs';
import path from 'path';
import pool, { query } from '../src/lib/db';
import { getSeedData } from '../src/lib/db/seed-data';

async function initDb() {
  console.log('🚀 Starting Database Initialization for ExamSetu (examsetu.in)...');

  try {
    const schemaPath = path.join(__dirname, '../src/lib/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Executing schema migrations...');
    await query(schemaSql);
    console.log('✅ Schema created successfully.');

    const { states, categories, organizations, users } = await getSeedData();

    // 1. Insert States
    console.log('📍 Seeding States...');
    const stateMap: Record<string, string> = {};
    for (const state of states) {
      const res = await query(
        `INSERT INTO states (code, name, type, capital)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, capital = EXCLUDED.capital
         RETURNING id, name`,
        [state.code, state.name, state.type, state.capital]
      );
      stateMap[res.rows[0].name] = res.rows[0].id;
    }

    // 2. Insert Categories
    console.log('🏷️ Seeding Categories...');
    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      const res = await query(
        `INSERT INTO categories (name, slug, description, icon)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.description, cat.icon]
      );
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 3. Insert Organizations
    console.log('🏛️ Seeding Conducting Organizations...');
    const orgMap: Record<string, string> = {};
    for (const org of organizations) {
      const res = await query(
        `INSERT INTO organizations (name, short_name, slug, official_domain, description, org_type, official_portal_url, helpline_number, contact_email, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           official_domain = EXCLUDED.official_domain,
           official_portal_url = EXCLUDED.official_portal_url,
           helpline_number = EXCLUDED.helpline_number,
           contact_email = EXCLUDED.contact_email
         RETURNING id, slug`,
        [org.name, org.short_name, org.slug, org.official_domain, org.description, org.org_type, org.official_portal_url, org.helpline_number, org.contact_email, org.is_verified]
      );
      orgMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 4. Insert Users
    console.log('👥 Seeding Users & Demo Accounts...');
    const userMap: Record<string, string> = {};
    for (const user of users) {
      const res = await query(
        `INSERT INTO users (email, password_hash, full_name, role, email_verified)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role = EXCLUDED.role
         RETURNING id, email`,
        [user.email, user.password_hash, user.full_name, user.role, user.email_verified]
      );
      const userId = res.rows[0].id;
      userMap[user.email] = userId;

      if ((user as any).profile) {
        const p = (user as any).profile;
        await query(
          `INSERT INTO profiles (user_id, class_level, board, state, stream, subjects, target_exams, career_interests)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id) DO UPDATE SET
             class_level = EXCLUDED.class_level,
             board = EXCLUDED.board,
             state = EXCLUDED.state,
             stream = EXCLUDED.stream,
             subjects = EXCLUDED.subjects,
             target_exams = EXCLUDED.target_exams,
             career_interests = EXCLUDED.career_interests`,
          [userId, p.class_level, p.board, p.state, p.stream, JSON.stringify(p.subjects), JSON.stringify(p.target_exams), JSON.stringify(p.career_interests)]
        );
      }
    }

    // 5. Insert Official Sources
    console.log('📡 Seeding Official Sources Registry...');
    const sourcesData = [
      {
        name: 'NTA Official Portal & News Feed',
        org_id: orgMap['nta'],
        official_domain: 'nta.ac.in',
        base_url: 'https://nta.ac.in/Notice',
        source_type: 'official_html',
        adapter_name: 'nta_adapter',
        check_interval_minutes: 30,
        health_status: 'healthy',
        response_time_ms: 142,
      },
      {
        name: 'UPSC Examination Notice Board',
        org_id: orgMap['upsc'],
        official_domain: 'upsc.gov.in',
        base_url: 'https://upsc.gov.in/examinations/active-examinations',
        source_type: 'official_html',
        adapter_name: 'upsc_adapter',
        check_interval_minutes: 45,
        health_status: 'healthy',
        response_time_ms: 198,
      },
      {
        name: 'SSC Official Recruitment Notices',
        org_id: orgMap['ssc'],
        official_domain: 'ssc.gov.in',
        base_url: 'https://ssc.gov.in/notices',
        source_type: 'official_html',
        adapter_name: 'ssc_adapter',
        check_interval_minutes: 30,
        health_status: 'healthy',
        response_time_ms: 175,
      },
      {
        name: 'CBSE Academic & Exam Portal',
        org_id: orgMap['cbse'],
        official_domain: 'cbse.gov.in',
        base_url: 'https://www.cbse.gov.in/cbsenew/cbse.html',
        source_type: 'official_html',
        adapter_name: 'cbse_adapter',
        check_interval_minutes: 60,
        health_status: 'healthy',
        response_time_ms: 220,
      },
      {
        name: 'MP Board (MPBSE) Timetable & Notices',
        org_id: orgMap['mpbse'],
        official_domain: 'mpbse.nic.in',
        base_url: 'https://mpbse.nic.in/announcements.htm',
        source_type: 'official_html',
        adapter_name: 'mpbse_adapter',
        check_interval_minutes: 60,
        health_status: 'healthy',
        response_time_ms: 310,
      },
      {
        name: 'MPPSC Official Examination Calendar',
        org_id: orgMap['mppsc'],
        official_domain: 'mppsc.mp.gov.in',
        base_url: 'https://mppsc.mp.gov.in/whats_new',
        source_type: 'official_html',
        adapter_name: 'mppsc_adapter',
        check_interval_minutes: 60,
        health_status: 'healthy',
        response_time_ms: 280,
      },
      {
        name: 'IBPS Online Career Notification Portal',
        org_id: orgMap['ibps'],
        official_domain: 'ibps.in',
        base_url: 'https://www.ibps.in/notifications',
        source_type: 'official_html',
        adapter_name: 'ibps_adapter',
        check_interval_minutes: 60,
        health_status: 'healthy',
        response_time_ms: 185,
      },
      {
        name: 'National Scholarship Portal (NSP) Feeds',
        org_id: orgMap['nsp'],
        official_domain: 'scholarships.gov.in',
        base_url: 'https://scholarships.gov.in/public/schemeGuidelines',
        source_type: 'official_html',
        adapter_name: 'scholarships_adapter',
        check_interval_minutes: 120,
        health_status: 'healthy',
        response_time_ms: 260,
      }
    ];

    const sourceMap: Record<string, string> = {};
    for (const src of sourcesData) {
      const res = await query(
        `INSERT INTO sources (name, org_id, official_domain, base_url, source_type, adapter_name, check_interval_minutes, health_status, response_time_ms, last_successful_fetch)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING id, adapter_name`,
        [src.name, src.org_id, src.official_domain, src.base_url, src.source_type, src.adapter_name, src.check_interval_minutes, src.health_status, src.response_time_ms]
      );
      sourceMap[res.rows[0].adapter_name] = res.rows[0].id;
    }

    // 6. Insert Comprehensive Exams
    console.log('📚 Seeding Comprehensive Indian Examinations...');
    const examsData = [
      {
        slug: 'neet-ug-2027',
        title: 'NEET UG 2027 (National Eligibility cum Entrance Test)',
        short_title: 'NEET UG',
        conducting_org_id: orgMap['nta'],
        category_id: categoryMap['medical-entrance'],
        level: 'National',
        stream_eligibility: ['PCB'],
        min_age: 17,
        max_age: null,
        eligibility_criteria: 'Passed or appearing in Class 12 or equivalent with Physics, Chemistry, Biology/Biotechnology, and English as core subjects. Minimum 50% marks in PCB (40% for SC/ST/OBC). Must complete 17 years of age on or before 31st December of the admission year.',
        exam_frequency: 'Once a year (Pen & Paper OMR)',
        official_website_url: 'https://exams.nta.ac.in/NEET/',
        registration_url: 'https://neet.nta.nic.in',
        syllabus_url: 'https://exams.nta.ac.in/NEET/images/neet-ug-syllabus-nmc.pdf',
        exam_pattern: {
          mode: 'Pen and Paper (OMR-based)',
          duration_minutes: 200,
          total_marks: 720,
          negative_marking: '-1 for each incorrect response, +4 for correct response',
          sections: [
            { name: 'Physics (Section A & B)', questions: 45, marks: 180 },
            { name: 'Chemistry (Section A & B)', questions: 45, marks: 180 },
            { name: 'Botany (Section A & B)', questions: 45, marks: 180 },
            { name: 'Zoology (Section A & B)', questions: 45, marks: 180 }
          ]
        },
        important_documents: [
          'Scanned Passport Photograph with white background (10KB - 200KB)',
          'Scanned Signature in black ink (4KB - 30KB)',
          'Postcard size photograph (4"x6")',
          'Class 10 Pass Certificate & Marks Card',
          'Valid Govt Identity Proof (Aadhaar / Passport / Voter ID)',
          'Category Certificate (EWS/OBC-NCL/SC/ST/PwD) if applicable'
        ],
        faqs: [
          {
            question: 'What is the upper age limit for NEET UG 2027?',
            answer: 'As per the National Medical Commission (NMC) guidelines, there is no upper age limit for appearing in the NEET UG examination.'
          },
          {
            question: 'Is NEET UG required for BDS and AYUSH admissions?',
            answer: 'Yes, NEET UG is the single mandatory entrance test for admission to MBBS, BDS, BAMS, BHMS, BUMS, and BSMS courses across all medical colleges in India.'
          },
          {
            question: 'How many times can a student appear for NEET UG?',
            answer: 'There is no limit on the number of attempts for NEET UG as long as the student satisfies the minimum age and academic eligibility.'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'Online Application Window',
            start_date: '2027-02-08',
            end_date: '2027-03-16',
            is_extended: true,
            previous_end_date: '2027-03-09',
            status: 'closing_soon',
            official_source_url: 'https://exams.nta.ac.in/NEET/public-notices/neet-reg-2027.pdf',
            notification_doc_url: 'https://exams.nta.ac.in/NEET/neet-ug-bulletin-2027.pdf',
            notes: 'Registration extended by 7 days upon student representation. Late fee not applicable before deadline.'
          },
          {
            event_type: 'correction_window',
            cycle_year: 2027,
            title: 'Application Correction Window',
            start_date: '2027-03-18',
            end_date: '2027-03-20',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://exams.nta.ac.in/NEET/',
            notes: 'Candidates can modify exam city preferences, category, and educational qualifications.'
          },
          {
            event_type: 'admit_card',
            cycle_year: 2027,
            title: 'City Intimation Slip & Admit Card Release',
            start_date: '2027-04-28',
            end_date: '2027-05-03',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://exams.nta.ac.in/NEET/',
            notes: 'Admit cards will be available for download using Application Number and Date of Birth.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'NEET UG 2027 Examination',
            start_date: '2027-05-03',
            end_date: '2027-05-03',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://exams.nta.ac.in/NEET/',
            notes: 'Examination timing: 02:00 PM to 05:20 PM IST in single shift across 550+ cities.'
          },
          {
            event_type: 'answer_key',
            cycle_year: 2027,
            title: 'Provisional Answer Key & Challenge Window',
            start_date: '2027-05-25',
            end_date: '2027-05-28',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://exams.nta.ac.in/NEET/',
            notes: 'Expected in late May 2027. ₹200 processing fee per question challenge.'
          },
          {
            event_type: 'result',
            cycle_year: 2027,
            title: 'NEET UG Scorecard & All India Rank (AIR)',
            start_date: '2027-06-14',
            end_date: '2027-06-14',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://exams.nta.ac.in/NEET/',
            notes: 'Cut-off percentiles and All India Ranks for 15% AIQ and 85% State Quota.'
          },
          {
            event_type: 'counselling',
            cycle_year: 2027,
            title: 'MCC All India Quota & State Counselling',
            start_date: '2027-07-05',
            end_date: '2027-08-30',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://mcc.nic.in',
            notes: 'Conducted online in 4 rounds by Medical Counselling Committee (MCC).'
          }
        ],
        updates: [
          {
            title: 'Application Deadline Extended to 16 March 2027',
            summary: 'National Testing Agency (NTA) has extended the last date for submitting online application forms for NEET UG 2027 to March 16, 2027 (11:50 PM) following requests from candidate communities.',
            old_value: 'Application deadline: 2027-03-09',
            new_value: 'Application deadline: 2027-03-16',
            update_type: 'date_extended',
            official_source_url: 'https://exams.nta.ac.in/NEET/public-notices/neet-reg-ext-2027.pdf',
            official_doc_ref: 'NTA/NEET-UG/2027/Notice-04',
            is_breaking: true,
            published_at: '2027-03-08T14:30:00Z'
          },
          {
            title: 'Information Bulletin & Syllabus Officially Released',
            summary: 'NTA published the detailed Information Bulletin confirming 720 total marks and 13 examination language mediums.',
            old_value: null,
            new_value: 'Official Bulletin 2027 released with NMC syllabus',
            update_type: 'general',
            official_source_url: 'https://exams.nta.ac.in/NEET/',
            is_breaking: false,
            published_at: '2027-02-08T09:00:00Z'
          }
        ]
      },
      {
        slug: 'jee-main-2027',
        title: 'JEE Main 2027 (Joint Entrance Examination Main)',
        short_title: 'JEE Main',
        conducting_org_id: orgMap['nta'],
        category_id: categoryMap['engineering-entrance'],
        level: 'National',
        stream_eligibility: ['PCM'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Passed Class 12 or equivalent qualifying examination in 2025, 2026, or appearing in 2027 with Physics, Mathematics, and one of Chemistry/Biology/Biotechnology/Technical Vocational subject. 75% aggregate marks in 12th board (65% for SC/ST) or top 20 percentile for NIT/IIIT/CFTI admission.',
        exam_frequency: 'Twice a year (Session 1 & Session 2 CBT)',
        official_website_url: 'https://jeemain.nta.ac.in',
        registration_url: 'https://jeemain.nta.nic.in',
        syllabus_url: 'https://jeemain.nta.ac.in/syllabus.pdf',
        exam_pattern: {
          mode: 'Computer Based Test (CBT)',
          duration_minutes: 180,
          total_marks: 300,
          negative_marking: '-1 for each incorrect answer, +4 for correct answer in MCQs and Numerical Value Questions',
          sections: [
            { name: 'Physics (20 MCQs + 5 Numerical)', questions: 25, marks: 100 },
            { name: 'Chemistry (20 MCQs + 5 Numerical)', questions: 25, marks: 100 },
            { name: 'Mathematics (20 MCQs + 5 Numerical)', questions: 25, marks: 100 }
          ]
        },
        important_documents: [
          'Passport Size Photo in JPG/JPEG format',
          'Signature scanned on white paper',
          'Category Certificate (Gen-EWS / OBC-NCL / SC / ST / PwD)',
          'Class 10 and Class 12 Board Marksheets',
          'Valid Aadhaar or DigiLocker authentication'
        ],
        faqs: [
          {
            question: 'Can I appear in both Session 1 and Session 2?',
            answer: 'Yes, candidates can appear in both sessions. The best of the two NTA percentile scores will be considered for ranking and JEE Advanced eligibility.'
          },
          {
            question: 'Is 75% criteria mandatory for appearing in JEE Main?',
            answer: 'No, you can appear for JEE Main without 75% marks, but 75% aggregate in 12th board is mandatory at the time of admission to NITs, IIITs, and CFTIs through JoSAA.'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'Session 2 Application Window',
            start_date: '2027-02-02',
            end_date: '2027-03-02',
            is_extended: false,
            previous_end_date: null,
            status: 'closed',
            official_source_url: 'https://jeemain.nta.ac.in',
            notes: 'Session 2 applications concluded.'
          },
          {
            event_type: 'admit_card',
            cycle_year: 2027,
            title: 'Session 2 Admit Card & Exam City Intimation',
            start_date: '2027-03-25',
            end_date: '2027-04-01',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://jeemain.nta.ac.in',
            notes: 'Admit cards released 3 days prior to exam dates.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'JEE Main 2027 Session 2 Exam Dates',
            start_date: '2027-04-01',
            end_date: '2027-04-12',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://jeemain.nta.ac.in',
            notes: 'Conducted in two shifts daily: Morning 9 AM - 12 PM, Afternoon 3 PM - 6 PM.'
          },
          {
            event_type: 'result',
            cycle_year: 2027,
            title: 'Session 2 Final NTA Score & All India Ranks',
            start_date: '2027-04-25',
            end_date: '2027-04-25',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://jeemain.nta.ac.in',
            notes: 'Top 2,50,000 candidates will qualify for JEE Advanced 2027.'
          }
        ],
        updates: [
          {
            title: 'Session 1 Final Answer Key and Percentiles Declared',
            summary: 'National Testing Agency declared the normalized NTA score percentiles for JEE Main 2027 Session 1. Candidates can view scorecards with roll number and DOB.',
            old_value: null,
            new_value: 'Session 1 Result declared on 12 Feb 2027',
            update_type: 'result_declared',
            official_source_url: 'https://jeemain.nta.ac.in',
            is_breaking: true,
            published_at: '2027-02-12T10:00:00Z'
          }
        ]
      },
      {
        slug: 'upsc-cse-2027',
        title: 'UPSC Civil Services Examination 2027 (IAS, IPS, IFS)',
        short_title: 'UPSC CSE',
        conducting_org_id: orgMap['upsc'],
        category_id: categoryMap['civil-services'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 21,
        max_age: 32,
        age_relaxation: { 'OBC': '3 years', 'SC/ST': '5 years', 'PwBD': '10 years' },
        eligibility_criteria: 'Graduate degree in any discipline from a recognized University or equivalent qualification. Candidates appearing in their final year degree examinations are also eligible to apply for Prelims.',
        exam_frequency: 'Once a year (3 Stages: Prelims, Mains, Interview)',
        official_website_url: 'https://upsc.gov.in',
        registration_url: 'https://upsconline.nic.in',
        syllabus_url: 'https://upsc.gov.in/examinations/revised-syllabus-scheme',
        exam_pattern: {
          mode: 'Offline Pen & Paper (OMR for Prelims, Descriptive for Mains)',
          duration_minutes: 240,
          total_marks: 2025,
          negative_marking: '-0.66 marks for GS Paper 1 & GS Paper 2 (CSAT) in Prelims',
          sections: [
            { name: 'Prelims GS Paper I (General Studies)', questions: 100, marks: 200 },
            { name: 'Prelims GS Paper II (CSAT - Qualifying 33%)', questions: 80, marks: 200 },
            { name: 'Mains Written Examination (9 Papers)', questions: 0, marks: 1750 },
            { name: 'Personality Test / Interview', questions: 0, marks: 275 }
          ]
        },
        important_documents: [
          'Scanned Photo & Signature in JPG format',
          'Valid Photo ID Card (Aadhaar / Passport / PAN Card)',
          'Graduation Degree Certificate or Bonafide Proof',
          'Community/Category Certificate (OBC-NCL / EWS / SC / ST)'
        ],
        faqs: [
          {
            question: 'What is the number of attempts permitted in UPSC CSE?',
            answer: 'General/EWS candidates are permitted 6 attempts up to age 32. OBC candidates have 9 attempts up to age 35. SC/ST candidates have unlimited attempts up to age 37.'
          },
          {
            question: 'Is CSAT Paper II marks counted for Prelims ranking?',
            answer: 'No, CSAT Paper II is strictly qualifying in nature with a mandatory minimum score of 33% (66 marks out of 200). Merit list for Prelims is determined purely on GS Paper I.'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'OTR Registration & Online Application',
            start_date: '2027-01-20',
            end_date: '2027-02-18',
            is_extended: false,
            previous_end_date: null,
            status: 'closed',
            official_source_url: 'https://upsconline.nic.in',
            notes: 'OTR (One Time Registration) mandatory before filling the CSE 2027 application.'
          },
          {
            event_type: 'admit_card',
            cycle_year: 2027,
            title: 'Civil Services Prelims e-Admit Card Release',
            start_date: '2027-05-08',
            end_date: '2027-05-24',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://upsc.gov.in',
            notes: 'e-Admit cards will be available 3 weeks prior to the preliminary exam date.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'Civil Services (Preliminary) Examination 2027',
            start_date: '2027-05-24',
            end_date: '2027-05-24',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://upsc.gov.in',
            notes: 'Paper I: 9:30 AM to 11:30 AM. Paper II (CSAT): 2:30 PM to 4:30 PM.'
          },
          {
            event_type: 'result',
            cycle_year: 2027,
            title: 'CSE Prelims Result & Mains DAF-I Release',
            start_date: '2027-06-20',
            end_date: '2027-06-20',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://upsc.gov.in',
            notes: 'Roll-number wise list of qualified candidates for Mains.'
          }
        ],
        updates: [
          {
            title: 'Official Notification 2027 Released with 1,056 Vacancies',
            summary: 'Union Public Service Commission notified 1,056 vacancies for Indian Administrative Service, Indian Police Service, Indian Foreign Service, and Central Group A & B services.',
            old_value: null,
            new_value: '1,056 vacancies notified for CSE 2027',
            update_type: 'general',
            official_source_url: 'https://upsc.gov.in/sites/default/files/Notif-CSP-2027-engl.pdf',
            official_doc_ref: 'UPSC Notice 05/2027-CSP',
            is_breaking: true,
            published_at: '2027-01-20T08:00:00Z'
          }
        ]
      },
      {
        slug: 'cbse-class-12-board-2027',
        title: 'CBSE Class 12 Board Examinations 2027',
        short_title: 'CBSE Class 12',
        conducting_org_id: orgMap['cbse'],
        category_id: categoryMap['school-boards'],
        level: 'National',
        stream_eligibility: ['PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Enrolled in Class 12 in a CBSE affiliated school with minimum 75% attendance and successful completion of Class 11 examination.',
        exam_frequency: 'Once a year (Annual Board Examination)',
        official_website_url: 'https://cbse.gov.in',
        registration_url: 'https://cbse.gov.in/cbsenew/cbse.html',
        syllabus_url: 'https://cbseacademic.nic.in/curriculum_2027.html',
        exam_pattern: {
          mode: 'Pen and Paper (Subjective & Objective)',
          duration_minutes: 180,
          total_marks: 100,
          negative_marking: 'No negative marking',
          sections: [
            { name: 'Theory Paper (Subjective + MCQs + Case Studies)', questions: 35, marks: 70 },
            { name: 'Internal Assessment / Practical Viva', questions: 0, marks: 30 }
          ]
        },
        important_documents: [
          'CBSE School Enrolment Roll Number',
          'School Identity Card',
          'Official CBSE Board Admit Card signed by School Principal'
        ],
        faqs: [
          {
            question: 'When will CBSE Class 12 Board results be announced?',
            answer: 'CBSE typically announces Class 12 Board results in the second week of May.'
          },
          {
            question: 'What is the minimum passing marks in CBSE Class 12?',
            answer: 'A candidate must obtain at least 33% marks in each subject separately in theory and practical/internal assessment, as well as 33% overall aggregate.'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'CBSE Class 12 Main Theory Examinations',
            start_date: '2027-02-15',
            end_date: '2027-04-04',
            is_extended: false,
            previous_end_date: null,
            status: 'open',
            official_source_url: 'https://cbse.gov.in',
            notes: 'Examinations start at 10:30 AM across all accredited exam centres in India and abroad.'
          },
          {
            event_type: 'result',
            cycle_year: 2027,
            title: 'CBSE Class 12 Results & DigiLocker Marksheets',
            start_date: '2027-05-12',
            end_date: '2027-05-12',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://results.cbse.nic.in',
            notes: 'Digital marksheets, pass certificates, and migration certificates available on DigiLocker.'
          }
        ],
        updates: [
          {
            title: 'CBSE Releases Clarification on Competency-Based Questions',
            summary: 'CBSE updated the 2027 board exam pattern with 50% competency-focused questions (MCQs, case-based questions, source-based integrated questions).',
            old_value: '40% competency questions',
            new_value: '50% competency questions',
            update_type: 'pattern_changed',
            official_source_url: 'https://cbseacademic.nic.in',
            is_breaking: false,
            published_at: '2026-11-15T10:00:00Z'
          }
        ]
      },
      {
        slug: 'cbse-class-10-board-2027',
        title: 'CBSE Class 10 Secondary School Examination 2027',
        short_title: 'CBSE Class 10',
        conducting_org_id: orgMap['cbse'],
        category_id: categoryMap['school-boards'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 14,
        max_age: null,
        eligibility_criteria: 'Enrolled in Class 10 in a CBSE-affiliated school with at least 75% attendance during the academic session.',
        exam_frequency: 'Once a year',
        official_website_url: 'https://cbse.gov.in',
        registration_url: 'https://cbse.gov.in',
        syllabus_url: 'https://cbseacademic.nic.in/curriculum_2027.html',
        exam_pattern: {
          mode: 'Pen and Paper',
          duration_minutes: 180,
          total_marks: 100,
          negative_marking: 'None',
          sections: [
            { name: 'Theory Paper (Objective + Short Answer + Long Answer)', questions: 38, marks: 80 },
            { name: 'Internal Assessment (Periodic Tests, Portfolio, Subject Enrichment)', questions: 0, marks: 20 }
          ]
        },
        important_documents: ['Admit Card with Principal Signature', 'School Identity Card'],
        faqs: [
          {
            question: 'Is basic mathematics eligible for Class 11 Science stream?',
            answer: 'Students opting for Basic Mathematics in Class 10 can opt for Applied Mathematics in Class 11 or take Standard Mathematics re-test to qualify for core PCM stream.'
          }
        ],
        is_featured: false,
        events: [
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'CBSE Class 10 Board Examinations',
            start_date: '2027-02-15',
            end_date: '2027-03-18',
            is_extended: false,
            previous_end_date: null,
            status: 'open',
            official_source_url: 'https://cbse.gov.in',
            notes: 'Exams ongoing in morning shift 10:30 AM - 1:30 PM.'
          },
          {
            event_type: 'result',
            cycle_year: 2027,
            title: 'CBSE Class 10 Board Result Declaration',
            start_date: '2027-05-13',
            end_date: '2027-05-13',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://results.cbse.nic.in',
            notes: 'Marksheets issued via DigiLocker and UMANG app.'
          }
        ],
        updates: []
      },
      {
        slug: 'mp-board-12th-hssc-2027',
        title: 'MP Board Class 12 Higher Secondary School Certificate Examination 2027',
        short_title: 'MP Board 12th',
        conducting_org_id: orgMap['mpbse'],
        state_id: stateMap['Madhya Pradesh'],
        category_id: categoryMap['school-boards'],
        level: 'State',
        stream_eligibility: ['PCB', 'PCM', 'Commerce', 'Arts/Humanities', 'Agriculture'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Students enrolled in Class 12 in recognized schools affiliated with the Madhya Pradesh Board of Secondary Education (MPBSE).',
        exam_frequency: 'Once a year (Annual Board + Supplementary)',
        official_website_url: 'https://mpbse.nic.in',
        registration_url: 'https://mpbse.mponline.gov.in',
        syllabus_url: 'https://mpbse.nic.in/syllabus.htm',
        exam_pattern: {
          mode: 'Pen and Paper (Hindi / English Medium)',
          duration_minutes: 180,
          total_marks: 100,
          negative_marking: 'No negative marking',
          sections: [
            { name: 'Theory Question Paper', questions: 20, marks: 75 },
            { name: 'Practical & Project Work', questions: 0, marks: 25 }
          ]
        },
        important_documents: ['MPBSE Class 12 Admit Card', 'School ID Card', 'Aadhaar Card'],
        faqs: [
          {
            question: 'When will MP Board 12th results be announced?',
            answer: 'MPBSE results are usually declared in late April or first week of May on mpresults.nic.in.'
          },
          {
            question: 'Does MP Board offer Ruk Jana Nahi scheme?',
            answer: 'Yes, Madhya Pradesh Open School Board conducts the "Ruk Jana Nahi" scheme for students who failed regular board exams, providing another chance in the same year.'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'MP Board Class 12 Examinations',
            start_date: '2027-02-06',
            end_date: '2027-03-05',
            is_extended: false,
            previous_end_date: null,
            status: 'open',
            official_source_url: 'https://mpbse.nic.in/Time_Table_2027.pdf',
            notes: 'Timings: 09:00 AM to 12:00 PM across all districts in Madhya Pradesh.'
          },
          {
            event_type: 'result',
            cycle_year: 2027,
            title: 'MP Board 12th Result Declaration',
            start_date: '2027-04-24',
            end_date: '2027-04-24',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://mpresults.nic.in',
            notes: 'Result links live on MPBSE official portal and MP Mobile App.'
          }
        ],
        updates: [
          {
            title: 'Timetable Released for Class 12 Board Examinations',
            summary: 'MPBSE published the detailed timetable starting from 6 February with Hindi and concluding with Elective subjects on 5 March.',
            old_value: null,
            new_value: 'Official Timetable 2027 published',
            update_type: 'general',
            official_source_url: 'https://mpbse.nic.in/Time_Table_2027.pdf',
            official_doc_ref: 'MPBSE/Exam/2027/1042',
            is_breaking: false,
            published_at: '2026-12-10T11:00:00Z'
          }
        ]
      },
      {
        slug: 'mppsc-state-services-2027',
        title: 'MPPSC State Services Examination 2027 (Madhya Pradesh PSC)',
        short_title: 'MPPSC SSE',
        conducting_org_id: orgMap['mppsc'],
        state_id: stateMap['Madhya Pradesh'],
        category_id: categoryMap['civil-services'],
        level: 'State',
        stream_eligibility: ['Any'],
        min_age: 21,
        max_age: 40,
        age_relaxation: { 'SC/ST/OBC/Women of MP': '5 years (up to 45 years)' },
        eligibility_criteria: 'Graduate from any recognized university in India or candidate appearing in final year of graduation degree. MP State Employment Portal (Rojgar Panjiyan) registration is desirable/mandatory for state residents.',
        exam_frequency: 'Once a year (Prelims, Mains, Interview)',
        official_website_url: 'https://mppsc.mp.gov.in',
        registration_url: 'https://mppsc.mponline.gov.in',
        syllabus_url: 'https://mppsc.mp.gov.in/syllabus',
        exam_pattern: {
          mode: 'Pen & Paper OMR for Prelims, Descriptive for Mains',
          duration_minutes: 240,
          total_marks: 1675,
          negative_marking: 'No negative marking in MPPSC Prelims',
          sections: [
            { name: 'Paper 1: General Studies', questions: 100, marks: 200 },
            { name: 'Paper 2: General Aptitude Test', questions: 100, marks: 200 },
            { name: 'Mains Written Examination (6 Papers)', questions: 0, marks: 1400 },
            { name: 'Personality Interview', questions: 0, marks: 175 }
          ]
        },
        important_documents: ['MP Rojgar Panjiyan Certificate', 'Graduation Certificate', 'MP Domicile Certificate', 'Caste Certificate (if applicable)'],
        faqs: [
          {
            question: 'Is there negative marking in MPPSC Prelims examination?',
            answer: 'No, MPPSC Prelims examination has zero negative marking. Each question carries 2 marks.'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'Online Application & Error Correction',
            start_date: '2027-01-15',
            end_date: '2027-02-14',
            is_extended: true,
            previous_end_date: '2027-02-07',
            status: 'closed',
            official_source_url: 'https://mppsc.mp.gov.in',
            notes: 'Application window concluded.'
          },
          {
            event_type: 'admit_card',
            cycle_year: 2027,
            title: 'State Services Prelims Admit Card Download',
            start_date: '2027-04-10',
            end_date: '2027-04-20',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://mppsc.mp.gov.in',
            notes: 'Available on MPPSC website and MP Online portal.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'MPPSC State Services (Preliminary) Exam 2027',
            start_date: '2027-04-20',
            end_date: '2027-04-20',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://mppsc.mp.gov.in',
            notes: 'Exam held across all 55 district headquarters of Madhya Pradesh.'
          }
        ],
        updates: [
          {
            title: 'Total Vacancies Increased to 242 Posts for SSE 2027',
            summary: 'Madhya Pradesh Public Service Commission issued a corrigendum adding 32 additional posts of Deputy Collector and DSP in SSE 2027.',
            old_value: '210 vacancies',
            new_value: '242 vacancies',
            update_type: 'general',
            official_source_url: 'https://mppsc.mp.gov.in/corrigendum-sse-2027.pdf',
            official_doc_ref: 'MPPSC/Corrigendum/2027/02',
            is_breaking: true,
            published_at: '2027-02-01T14:00:00Z'
          }
        ]
      },
      {
        slug: 'ssc-cgl-2027',
        title: 'SSC CGL 2027 (Combined Graduate Level Examination)',
        short_title: 'SSC CGL',
        conducting_org_id: orgMap['ssc'],
        category_id: categoryMap['staff-selection'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 18,
        max_age: 32,
        eligibility_criteria: 'Bachelor’s Degree from a recognized University or equivalent. Specific posts like Junior Statistical Officer require 60% in Mathematics at 10+2 level or Degree in Statistics.',
        exam_frequency: 'Once a year (Tier 1 CBT & Tier 2 CBT)',
        official_website_url: 'https://ssc.gov.in',
        registration_url: 'https://ssc.gov.in/portal/apply',
        syllabus_url: 'https://ssc.gov.in/notice-cgl-2027.pdf',
        exam_pattern: {
          mode: 'Computer Based Test (CBT)',
          duration_minutes: 60,
          total_marks: 200,
          negative_marking: '-0.50 marks per incorrect response in Tier 1',
          sections: [
            { name: 'General Intelligence & Reasoning', questions: 25, marks: 50 },
            { name: 'General Awareness', questions: 25, marks: 50 },
            { name: 'Quantitative Aptitude', questions: 25, marks: 50 },
            { name: 'English Comprehension', questions: 25, marks: 50 }
          ]
        },
        important_documents: ['Live webcam photo capture on new SSC portal', 'Scanned Signature', 'Graduation Certificate', 'Category Certificate'],
        faqs: [
          {
            question: 'Is SSC CGL Tier 1 qualifying or counted in final merit?',
            answer: 'Tier 1 is strictly qualifying in nature. Final merit list is determined exclusively on scores of Tier 2 examination.'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'SSC CGL 2027 Online Application Window',
            start_date: '2027-06-11',
            end_date: '2027-07-10',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://ssc.gov.in',
            notes: 'Registration requires active OTR on the new ssc.gov.in portal.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'SSC CGL Tier 1 Examination Dates',
            start_date: '2027-09-15',
            end_date: '2027-09-28',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://ssc.gov.in',
            notes: 'Dates as per annual examination calendar.'
          }
        ],
        updates: []
      },
      {
        slug: 'cuet-ug-2027',
        title: 'CUET UG 2027 (Common University Entrance Test for Undergraduates)',
        short_title: 'CUET UG',
        conducting_org_id: orgMap['nta'],
        category_id: categoryMap['university-entrance'],
        level: 'National',
        stream_eligibility: ['PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Candidates who have passed Class 12 or equivalent qualifying examination or appearing in 2027 can appear in CUET UG. No upper age limit.',
        exam_frequency: 'Once a year (Hybrid CBT & Pen-Paper Mode)',
        official_website_url: 'https://exams.nta.ac.in/CUET-UG/',
        registration_url: 'https://cuetug.ntaonline.in',
        syllabus_url: 'https://cuetug.ntaonline.in/syllabus',
        exam_pattern: {
          mode: 'Hybrid Mode (CBT & OMR Pen-Paper)',
          duration_minutes: 45,
          total_marks: 250,
          negative_marking: '-1 for each wrong answer, +5 for correct answer',
          sections: [
            { name: 'Section 1A & 1B: Languages', questions: 40, marks: 200 },
            { name: 'Section 2: Domain Specific Subjects', questions: 40, marks: 200 },
            { name: 'Section 3: General Test', questions: 50, marks: 250 }
          ]
        },
        important_documents: ['Passport Photograph', 'Signature', 'Class 10 Certificate', 'Category Certificate'],
        faqs: [
          {
            question: 'How many maximum subjects can a student select in CUET UG?',
            answer: 'A candidate can select up to a maximum of 6 subjects (including languages, domain subjects, and General Test).'
          }
        ],
        is_featured: true,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'CUET UG 2027 Application Form Submission',
            start_date: '2027-02-27',
            end_date: '2027-03-31',
            is_extended: false,
            previous_end_date: null,
            status: 'open',
            official_source_url: 'https://exams.nta.ac.in/CUET-UG/',
            notes: 'Applications open for 250+ central, state, deemed, and private universities including DU, BHU, JNU, and AMU.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'CUET UG 2027 Examination Window',
            start_date: '2027-05-15',
            end_date: '2027-05-31',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://exams.nta.ac.in/CUET-UG/',
            notes: 'Conducted in 13 medium languages across India and international test cities.'
          }
        ],
        updates: []
      },
      {
        slug: 'clat-ug-2027',
        title: 'CLAT 2027 (Common Law Admission Test for NLUs)',
        short_title: 'CLAT UG',
        conducting_org_id: orgMap['consortium-of-nlus'],
        category_id: categoryMap['law-entrance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Passed 10+2 or equivalent with minimum 45% marks (40% in case of SC/ST candidates). Candidates appearing in qualifying board exams in 2027 also eligible.',
        exam_frequency: 'Once a year (Pen & Paper OMR)',
        official_website_url: 'https://consortiumofnlus.ac.in',
        registration_url: 'https://consortiumofnlus.ac.in/clat-2027/',
        syllabus_url: 'https://consortiumofnlus.ac.in/clat-2027/syllabus.html',
        exam_pattern: {
          mode: 'Offline Pen & Paper OMR',
          duration_minutes: 120,
          total_marks: 120,
          negative_marking: '-0.25 marks for every wrong answer, +1 for correct',
          sections: [
            { name: 'English Language', questions: 24, marks: 24 },
            { name: 'Current Affairs including General Knowledge', questions: 30, marks: 30 },
            { name: 'Legal Reasoning', questions: 32, marks: 32 },
            { name: 'Logical Reasoning', questions: 24, marks: 24 },
            { name: 'Quantitative Techniques', questions: 10, marks: 10 }
          ]
        },
        important_documents: ['Front Facing Passport Photo', 'Signature', 'Category / Domicile Certificate'],
        faqs: [
          {
            question: 'Does CLAT have passage-based comprehension questions?',
            answer: 'Yes, all 120 questions in CLAT UG are passage-based testing reading comprehension and critical thinking.'
          }
        ],
        is_featured: false,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'CLAT 2027 Registration Portal Opening',
            start_date: '2026-07-07',
            end_date: '2026-10-22',
            is_extended: false,
            previous_end_date: null,
            status: 'closed',
            official_source_url: 'https://consortiumofnlus.ac.in',
            notes: 'Registration concluded.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'CLAT 2027 National Examination',
            start_date: '2026-12-06',
            end_date: '2026-12-06',
            is_extended: false,
            previous_end_date: null,
            status: 'completed',
            official_source_url: 'https://consortiumofnlus.ac.in',
            notes: 'Exam completed smoothly across 139 test centers.'
          },
          {
            event_type: 'counselling',
            cycle_year: 2027,
            title: 'NLU Centralised Admission Counselling',
            start_date: '2027-01-10',
            end_date: '2027-05-20',
            is_extended: false,
            previous_end_date: null,
            status: 'open',
            official_source_url: 'https://consortiumofnlus.ac.in',
            notes: 'Round 3 seat allotment list published.'
          }
        ],
        updates: []
      },
      {
        slug: 'cat-2027',
        title: 'CAT 2027 (Common Admission Test for IIMs)',
        short_title: 'CAT',
        conducting_org_id: orgMap['iim-cat'],
        category_id: categoryMap['management-entrance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Bachelor’s Degree with at least 50% marks or equivalent CGPA (45% for SC/ST/PwD). Final year graduation candidates also eligible.',
        exam_frequency: 'Once a year (CBT in 3 shifts)',
        official_website_url: 'https://iimcat.ac.in',
        registration_url: 'https://iimcat.ac.in',
        syllabus_url: 'https://iimcat.ac.in',
        exam_pattern: {
          mode: 'Computer Based Test (CBT)',
          duration_minutes: 120,
          total_marks: 198,
          negative_marking: '-1 for wrong MCQ answer, 0 for Non-MCQ / TITA answers',
          sections: [
            { name: 'Verbal Ability & Reading Comprehension (VARC)', questions: 24, marks: 72 },
            { name: 'Data Interpretation & Logical Reasoning (DILR)', questions: 20, marks: 60 },
            { name: 'Quantitative Aptitude (QA)', questions: 22, marks: 66 }
          ]
        },
        important_documents: ['Degree Marks Card', 'Passport Photo', 'Category Certificate (NC-OBC/SC/ST/EWS)'],
        faqs: [
          {
            question: 'Is sectional timing present in CAT?',
            answer: 'Yes, each of the 3 sections has a fixed 40-minute limit. Candidates cannot switch between sections.'
          }
        ],
        is_featured: false,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'CAT 2027 Online Registration',
            start_date: '2027-08-04',
            end_date: '2027-09-15',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://iimcat.ac.in',
            notes: 'Official notification releases in July 2027.'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'CAT 2027 Examination',
            start_date: '2027-11-28',
            end_date: '2027-11-28',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://iimcat.ac.in',
            notes: 'Held on the last Sunday of November.'
          }
        ],
        updates: []
      },
      {
        slug: 'ibps-po-2027',
        title: 'IBPS PO / MT XIV (Probationary Officers in Public Sector Banks)',
        short_title: 'IBPS PO',
        conducting_org_id: orgMap['ibps'],
        category_id: categoryMap['banking-insurance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 20,
        max_age: 30,
        eligibility_criteria: 'A Degree (Graduation) in any discipline from a University recognized by the Govt. of India. Working knowledge of computer systems is mandatory.',
        exam_frequency: 'Once a year (Prelims CBT, Mains CBT, Interview)',
        official_website_url: 'https://ibps.in',
        registration_url: 'https://ibpsonline.ibps.in',
        syllabus_url: 'https://ibps.in',
        exam_pattern: {
          mode: 'Computer Based Test (CBT)',
          duration_minutes: 60,
          total_marks: 100,
          negative_marking: '-0.25 marks for every wrong answer',
          sections: [
            { name: 'English Language (20 mins)', questions: 30, marks: 30 },
            { name: 'Quantitative Aptitude (20 mins)', questions: 35, marks: 35 },
            { name: 'Reasoning Ability (20 mins)', questions: 35, marks: 35 }
          ]
        },
        important_documents: ['Left Thumb Impression', 'Handwritten Declaration', 'Passport Photo', 'Signature in black ink'],
        faqs: [
          {
            question: 'Which banks recruit through IBPS PO?',
            answer: '11 participating public sector banks including Bank of Baroda, Canara Bank, Punjab National Bank, Union Bank of India, and Bank of India.'
          }
        ],
        is_featured: false,
        events: [
          {
            event_type: 'registration',
            cycle_year: 2027,
            title: 'Online Application & Fee Payment',
            start_date: '2027-08-01',
            end_date: '2027-08-28',
            is_extended: false,
            previous_end_date: null,
            status: 'upcoming',
            official_source_url: 'https://ibps.in',
            notes: 'Common Recruitment Process (CRP PO/MT-XIV).'
          },
          {
            event_type: 'exam',
            cycle_year: 2027,
            title: 'IBPS PO Preliminary Examination',
            start_date: '2027-10-17',
            end_date: '2027-10-24',
            is_extended: false,
            previous_end_date: null,
            status: 'unannounced',
            official_source_url: 'https://ibps.in',
            notes: 'Online preliminary examination across India.'
          }
        ],
        updates: []
      }
    ];

    const examMap: Record<string, string> = {};
    for (const ex of examsData) {
      const res = await query(
        `INSERT INTO exams (
          slug, title, short_title, conducting_org_id, state_id, category_id, level,
          stream_eligibility, min_age, max_age, age_relaxation, eligibility_criteria,
          exam_frequency, official_website_url, registration_url, syllabus_url,
          exam_pattern, important_documents, faqs, is_featured, last_verified_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          short_title = EXCLUDED.short_title,
          eligibility_criteria = EXCLUDED.eligibility_criteria,
          exam_pattern = EXCLUDED.exam_pattern,
          important_documents = EXCLUDED.important_documents,
          faqs = EXCLUDED.faqs,
          is_featured = EXCLUDED.is_featured,
          last_verified_at = NOW()
        RETURNING id, slug`,
        [
          ex.slug,
          ex.title,
          ex.short_title,
          ex.conducting_org_id,
          ex.state_id || null,
          ex.category_id,
          ex.level,
          JSON.stringify(ex.stream_eligibility),
          ex.min_age,
          ex.max_age,
          JSON.stringify(ex.age_relaxation || {}),
          ex.eligibility_criteria,
          ex.exam_frequency,
          ex.official_website_url,
          ex.registration_url,
          ex.syllabus_url,
          JSON.stringify(ex.exam_pattern),
          JSON.stringify(ex.important_documents),
          JSON.stringify(ex.faqs),
          ex.is_featured,
        ]
      );
      const examId = res.rows[0].id;
      examMap[ex.slug] = examId;

      // Insert Exam Events
      for (const ev of ex.events) {
        const evRes = await query(
          `INSERT INTO exam_events (
            exam_id, cycle_year, event_type, title, start_date, end_date,
            is_extended, previous_end_date, status, official_source_url,
            notification_doc_url, notes, last_verified_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          ON CONFLICT (exam_id, cycle_year, event_type) DO UPDATE SET
            title = EXCLUDED.title,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            is_extended = EXCLUDED.is_extended,
            previous_end_date = EXCLUDED.previous_end_date,
            status = EXCLUDED.status,
            official_source_url = EXCLUDED.official_source_url,
            notes = EXCLUDED.notes,
            last_verified_at = NOW()
          RETURNING id`,
          [
            examId,
            ev.cycle_year,
            ev.event_type,
            ev.title,
            ev.start_date,
            ev.end_date,
            ev.is_extended,
            ev.previous_end_date,
            ev.status,
            ev.official_source_url,
            (ev as any).notification_doc_url || null,
            ev.notes,
          ]
        );
      }

      // Insert Exam Updates
      for (const up of ex.updates) {
        await query(
          `INSERT INTO exam_updates (
            exam_id, title, summary, old_value, new_value,
            update_type, official_source_url, official_doc_ref, is_breaking, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            examId,
            up.title,
            up.summary,
            up.old_value,
            up.new_value,
            up.update_type,
            up.official_source_url,
            up.official_doc_ref || null,
            up.is_breaking,
            up.published_at,
          ]
        );
      }
    }

    // 7. Insert Opportunities
    console.log('🌟 Seeding Genuine Student Opportunities & Scholarships...');
    const oppsData = [
      {
        slug: 'nsp-central-sector-scholarship-2027',
        title: 'Central Sector Scheme of Scholarship for College and University Students (CSSS)',
        org_id: orgMap['nsp'],
        opp_type: 'scholarship',
        description: 'Department of Higher Education initiative to provide financial assistance to meritorious students from low-income families for pursuing higher studies.',
        eligibility: 'Above 80th percentile of successful candidates in the relevant stream from a particular Board of Examination in Class 12. Family income must not exceed ₹4.50 Lakh per annum.',
        qualification: 'Class 12 Passed (Enrolled in Regular Degree Course)',
        min_age: 17,
        max_age: 25,
        location: 'All India',
        stream: ['PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
        application_start: '2026-10-01',
        application_deadline: '2027-03-31',
        is_deadline_extended: true,
        previous_deadline: '2027-01-31',
        benefits: '₹12,000 per annum for Graduation (first 3 years) and ₹20,000 per annum for Post-Graduation. Paid directly to bank account via DBT PFMS.',
        financial_aid_amount: '₹12,000 - ₹20,000 / Year',
        application_process: 'Apply online on the National Scholarship Portal (scholarships.gov.in) with Aadhaar-linked bank account and bonafide institute verification.',
        official_source_url: 'https://scholarships.gov.in/public/schemeGuidelines/DoHE_CSSS_Guidelines.pdf',
        official_portal_link: 'https://scholarships.gov.in',
        documents_required: [
          'Aadhaar Card Linked to Active Bank Account',
          'Income Certificate issued by competent Revenue Authority (Below ₹4.5L)',
          'Class 12 Board Marksheet showing >80th percentile',
          'Bonafide Student Certificate from College/University',
          'Fee Receipt of current academic year'
        ],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'inspire-she-scholarship-dst-2027',
        title: 'INSPIRE Scholarship for Higher Education (SHE) by Dept of Science & Technology',
        org_id: orgMap['nsp'],
        opp_type: 'scholarship',
        description: 'Government of India scholarship to attract talent to the study of Natural and Basic Sciences at the B.Sc., B.S., and Int. M.Sc. levels.',
        eligibility: 'Top 1% meritorious students in Class 12 Board exams enrolled in Natural/Basic Sciences courses (Physics, Chemistry, Maths, Biology, Stats, Geology). Or Rank within top 10,000 in JEE/NEET opting for Natural Sciences.',
        qualification: 'Class 12 Passed with Science stream',
        min_age: 17,
        max_age: 22,
        location: 'All India',
        stream: ['PCM', 'PCB'],
        application_start: '2026-11-01',
        application_deadline: '2027-03-15',
        is_deadline_extended: false,
        previous_deadline: null,
        benefits: 'Total ₹80,000 per year (₹60,000 annual scholarship + ₹20,000 mentorship grant for summer research project).',
        financial_aid_amount: '₹80,000 / Year',
        application_process: 'Online submission through the INSPIRE portal with Endorsement Certificate from University Head.',
        official_source_url: 'https://online-inspire.gov.in',
        official_portal_link: 'https://online-inspire.gov.in',
        documents_required: [
          'Class 12 Board Marksheet',
          'Endorsement Certificate in prescribed format signed by Principal/Director',
          'Aadhaar Card',
          'SBI Bank Account Passbook copy',
          'Class 10 Certificate for Date of Birth'
        ],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'isro-yuvika-young-scientist-2027',
        title: 'ISRO YUVIKA 2027 (Young Scientist Programme / Yuva Vigyani Karyakram)',
        org_id: orgMap['isro'],
        opp_type: 'fellowship',
        description: 'Special program to impart basic knowledge on Space Technology, Space Science, and Space Applications to young students with preference to rural areas.',
        eligibility: 'Students studying in Class 9 as on 1 January 2027. Selection based on Class 8 marks, science fairs, olympiads, NCC/NSS/Scouts participation, and rural school background.',
        qualification: 'Class 9 Students',
        min_age: 13,
        max_age: 15,
        location: 'ISRO Centers (VSSC, URSC, SAC, NRSC, NE-SAC, IIRS)',
        stream: ['Any'],
        application_start: '2027-02-15',
        application_deadline: '2027-03-20',
        is_deadline_extended: false,
        previous_deadline: null,
        benefits: 'Fully funded 2-week residential training program at ISRO Centers. Free travel (II AC train fare), accommodation, course material, and experimental kit.',
        financial_aid_amount: '100% Fully Funded Sponsorship',
        application_process: 'Register on ISRO Antariksha Jigyasa Portal, take online quiz, and upload certified documents.',
        official_source_url: 'https://jigyasa.iirs.gov.in/yuvika',
        official_portal_link: 'https://jigyasa.iirs.gov.in/yuvika',
        documents_required: [
          'Class 8 Official Marksheet verified by School Head',
          'Certificate of Science Competition / Olympiad Rank',
          'NCC/NSS/Scouts Certificate if applicable',
          'Certificate of Rural School Study from Principal'
        ],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'drdo-apprentice-training-2027',
        title: 'DRDO Graduate & Technician Apprenticeship Program 2027',
        org_id: orgMap['isro'],
        opp_type: 'apprenticeship',
        description: 'Defence Research and Development Organisation invites applications for 1-year apprenticeship training under the Apprentices Act 1961.',
        eligibility: 'Degree in Engineering / Technology (B.E/B.Tech) or Diploma in Engineering from a recognized University / Board. Must be registered on NATS portal (nats.education.gov.in).',
        qualification: 'B.Tech / B.E / Polytechnic Diploma',
        min_age: 18,
        max_age: 28,
        location: 'DRDO Labs across India (DMRL, DRDL, ADE, LRDE)',
        stream: ['PCM'],
        application_start: '2027-02-01',
        application_deadline: '2027-03-10',
        is_deadline_extended: false,
        previous_deadline: null,
        benefits: 'Stipend of ₹9,000/month for Graduate Apprentices and ₹8,000/month for Technician Apprentices with real-world defence R&D experience.',
        financial_aid_amount: '₹8,000 - ₹9,000 / Month',
        application_process: 'Apply via NATS National Apprenticeship Training Scheme portal and email required bio-data.',
        official_source_url: 'https://drdo.gov.in/careers',
        official_portal_link: 'https://drdo.gov.in',
        documents_required: ['NATS Enrolment ID', 'Engineering Degree / Diploma Certificate', 'Aadhaar Card', 'Medical Fitness Certificate'],
        status: 'open',
        is_featured: false,
      },
      {
        slug: 'gsoc-india-open-source-2027',
        title: 'Google Summer of Code (GSoC) 2027 Developer Opportunity',
        org_id: orgMap['nta'],
        opp_type: 'internship',
        description: 'Global online program focused on bringing new contributors into open-source software development with mentoring from open source organizations.',
        eligibility: 'Students or open source beginners aged 18+ who are enrolled in higher education or self-taught developers.',
        qualification: 'Undergraduate, Postgraduate, or Self-Taught Programmers',
        min_age: 18,
        max_age: null,
        location: 'Remote (Work from Home)',
        stream: ['PCM', 'Any'],
        application_start: '2027-03-20',
        application_deadline: '2027-04-08',
        is_deadline_extended: false,
        previous_deadline: null,
        benefits: 'Direct international stipend ranging from $1,500 to $3,000 USD (approx ₹1.25L - ₹2.5L INR) based on country PPP and project scale.',
        financial_aid_amount: '$1,500 - $3,000 USD (₹1,25,000 - ₹2,50,000)',
        application_process: 'Submit technical project proposal to accepted open source mentor organizations through official GSoC website.',
        official_source_url: 'https://summerofcode.withgoogle.com',
        official_portal_link: 'https://summerofcode.withgoogle.com',
        documents_required: ['Student ID / Proof of Enrolment or Identification', 'GitHub / GitLab Profile & Code Samples', 'Detailed Project Proposal PDF'],
        status: 'upcoming',
        is_featured: true,
      }
    ];

    const oppMap: Record<string, string> = {};
    for (const opp of oppsData) {
      const res = await query(
        `INSERT INTO opportunities (
          slug, title, org_id, opp_type, description, eligibility, qualification,
          min_age, max_age, location, stream, application_start, application_deadline,
          is_deadline_extended, previous_deadline, benefits, financial_aid_amount,
          application_process, official_source_url, official_portal_link,
          documents_required, status, last_verified_at, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), $23)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          eligibility = EXCLUDED.eligibility,
          benefits = EXCLUDED.benefits,
          financial_aid_amount = EXCLUDED.financial_aid_amount,
          application_deadline = EXCLUDED.application_deadline,
          status = EXCLUDED.status,
          last_verified_at = NOW()
        RETURNING id, slug`,
        [
          opp.slug,
          opp.title,
          opp.org_id,
          opp.opp_type,
          opp.description,
          opp.eligibility,
          opp.qualification,
          opp.min_age,
          opp.max_age,
          opp.location,
          JSON.stringify(opp.stream),
          opp.application_start,
          opp.application_deadline,
          opp.is_deadline_extended,
          opp.previous_deadline,
          opp.benefits,
          opp.financial_aid_amount,
          opp.application_process,
          opp.official_source_url,
          opp.official_portal_link,
          JSON.stringify(opp.documents_required),
          opp.status,
          opp.is_featured,
        ]
      );
      oppMap[opp.slug] = res.rows[0].id;
    }

    // 8. Insert Review Queue Items (for Admin Demonstration)
    console.log('📋 Seeding Review Queue items with AI Extraction diffs...');
    const reviewItems = [
      {
        source_id: sourceMap['nta_adapter'],
        document_url: 'https://exams.nta.ac.in/NEET/public-notices/neet-reg-ext-2027.pdf',
        document_title: 'Public Notice: Extension of Last Date for NEET UG 2027',
        target_entity_type: 'exam_event',
        target_entity_id: examMap['neet-ug-2027'],
        extracted_data: {
          event_type: 'registration',
          title: 'NEET UG 2027 Registration Extension',
          start_date: '2027-02-08',
          end_date: '2027-03-16',
          is_extension: true,
          fees: 'General: ₹1700, Gen-EWS/OBC-NCL: ₹1600, SC/ST/PwBD: ₹1000',
          summary: 'Online applications will now be accepted up to 16 March 2027 (11:50 PM). Correction window will open on 18 March.',
          official_link: 'https://exams.nta.ac.in/NEET/public-notices/neet-reg-ext-2027.pdf'
        },
        proposed_changes: {
          end_date: '2027-03-16',
          is_extended: true,
          previous_end_date: '2027-03-09'
        },
        diff_summary: [
          {
            field: 'Registration End Date',
            old_value: '2027-03-09',
            new_value: '2027-03-16',
            is_change: true
          },
          {
            field: 'Is Extended',
            old_value: false,
            new_value: true,
            is_change: true
          }
        ],
        ai_confidence: 0.96,
        ai_reasoning: 'Extracted from official NTA PDF header signed by Senior Director. High confidence in date formats and extension phrasing.',
        review_status: 'approved',
        reviewed_by: userMap['admin@examsetu.in'],
        review_notes: 'Verified against official NTA press release. Approved for live timeline update.',
        reviewed_at: '2027-03-08T15:00:00Z'
      },
      {
        source_id: sourceMap['mppsc_adapter'],
        document_url: 'https://mppsc.mp.gov.in/notices/mppsc-admit-card-update.pdf',
        document_title: 'MPPSC Notice regarding Prelims Exam Center Allocation & Hall Tickets',
        target_entity_type: 'exam_event',
        target_entity_id: examMap['mppsc-state-services-2027'],
        extracted_data: {
          event_type: 'admit_card',
          title: 'MPPSC Prelims Admit Card Download',
          start_date: '2027-04-10',
          end_date: '2027-04-20',
          is_extension: false,
          summary: 'Candidates can download their e-admit card from 10 April 2027 using Application Number and Date of Birth.',
          official_link: 'https://mppsc.mp.gov.in'
        },
        proposed_changes: {
          start_date: '2027-04-10',
          end_date: '2027-04-20',
          status: 'upcoming'
        },
        diff_summary: [
          {
            field: 'Admit Card Start Date',
            old_value: '2027-04-12',
            new_value: '2027-04-10',
            is_change: true
          }
        ],
        ai_confidence: 0.88,
        ai_reasoning: 'Clear notice date published on MPPSC What’s New section. Validated domain mppsc.mp.gov.in.',
        review_status: 'pending',
        review_notes: null
      }
    ];

    for (const r of reviewItems) {
      await query(
        `INSERT INTO review_queue (
          source_id, document_url, document_title, target_entity_type, target_entity_id,
          extracted_data, proposed_changes, diff_summary, ai_confidence, ai_reasoning,
          review_status, reviewed_by, review_notes, reviewed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          r.source_id,
          r.document_url,
          r.document_title,
          r.target_entity_type,
          r.target_entity_id,
          JSON.stringify(r.extracted_data),
          JSON.stringify(r.proposed_changes),
          JSON.stringify(r.diff_summary),
          r.ai_confidence,
          r.ai_reasoning,
          r.review_status,
          r.reviewed_by || null,
          r.review_notes || null,
          r.reviewed_at || null,
        ]
      );
    }

    // 9. Insert Demo Student Application Tracker & Saved Items
    console.log('📌 Seeding Demo Student Tracker Items...');
    const demoStudentId = userMap['student@examsetu.in'];
    if (demoStudentId) {
      await query(
        `INSERT INTO application_tracker (
          user_id, target_type, target_id, status, application_number, roll_number,
          exam_date, exam_center, private_notes, documents_checklist
        ) VALUES
        ($1, 'exam', $2, 'applied', '270410098231', 'MP0301042', '2027-05-03', 'Indore Test Center - Holkar Science College', 'Need to practice Physics numericals daily. Photo ID verified.', '[{"name":"Aadhaar Card","completed":true},{"name":"Admit Card Printout","completed":false},{"name":"Passport Photos (4)","completed":true}]'::jsonb),
        ($1, 'exam', $3, 'interested', null, null, '2027-05-15', null, 'Targeting Delhi University B.Sc. (Hons) Biomedical Science.', '[{"name":"Class 12 Marksheet","completed":true},{"name":"Category Certificate","completed":false}]'::jsonb),
        ($1, 'opportunity', $4, 'will_apply', null, null, null, null, 'Documents need signature from College Dean next Monday.', '[{"name":"Income Certificate","completed":true},{"name":"Fee Receipt","completed":false}]'::jsonb)
        ON CONFLICT (user_id, target_type, target_id) DO NOTHING`,
        [demoStudentId, examMap['neet-ug-2027'], examMap['cuet-ug-2027'], oppMap['nsp-central-sector-scholarship-2027']]
      );

      // Save bookmarks
      await query(
        `INSERT INTO saved_exams (user_id, exam_id, notes)
         VALUES ($1, $2, 'Target Medical College: AIIMS Bhopal / MGM Indore')
         ON CONFLICT (user_id, exam_id) DO NOTHING`,
        [demoStudentId, examMap['neet-ug-2027']]
      );

      await query(
        `INSERT INTO saved_opportunities (user_id, opportunity_id, notes)
         VALUES ($1, $2, 'Check eligibility percentage cutoff')
         ON CONFLICT (user_id, opportunity_id) DO NOTHING`,
        [demoStudentId, oppMap['nsp-central-sector-scholarship-2027']]
      );

      // Notifications
      await query(
        `INSERT INTO notifications (user_id, title, message, link, type, is_read)
         VALUES
         ($1, 'NEET UG 2027 Registration Extended', 'NTA has extended the deadline to 16 March 2027. Ensure your application is finalized.', '/exams/neet-ug-2027', 'deadline', false),
         ($1, 'CBSE Class 12 Boards Ongoing', 'Check your exam center timing guidelines for tomorrow’s paper.', '/exams/cbse-class-12-board-2027', 'exam_alert', false),
         ($1, 'NSP Scholarship Portal Closing Soon', 'Central Sector Scheme application window closes on 31 March 2027.', '/opportunities/nsp-central-sector-scholarship-2027', 'opportunity', true)`,
        [demoStudentId]
      );
    }

    // 10. Insert Source Fetch Logs
    console.log('📊 Seeding Source Fetch Logs...');
    const sampleSources = await query(`SELECT id, adapter_name FROM sources`);
    for (const row of sampleSources.rows) {
      await query(
        `INSERT INTO source_fetch_logs (source_id, page_url, status_code, response_time_ms, content_changed, items_detected)
         VALUES ($1, 'https://example.gov.in/notices', 200, 180, true, 2)`,
        [row.id]
      );
    }

    console.log('🎉 Database Initialization Completed Successfully!');
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                   ExamSetu (examsetu.in)                         ║
║               Database Seeded & Ready for Production             ║
╠══════════════════════════════════════════════════════════════════╣
║ Default Accounts:                                                ║
║ • Admin:    admin@examsetu.in    / ExamAdmin@2026                ║
║ • Verifier: verifier@examsetu.in / Verifier@2026                 ║
║ • Student:  student@examsetu.in  / Student@1234                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  } catch (err: any) {
    console.error('❌ Database Initialization Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
