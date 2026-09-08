import fs from 'fs';
import path from 'path';
import pool, { query } from '../src/lib/db';

async function seedFullDatabase() {
  console.log('🇮🇳 Starting Ultra-Comprehensive Database Seeding for ExamSetu...');

  try {
    // 1. Fetch categories, states, and organizations
    const catRes = await query(`SELECT id, slug FROM categories`);
    const categoryMap: Record<string, string> = {};
    catRes.rows.forEach(r => categoryMap[r.slug] = r.id);

    const orgRes = await query(`SELECT id, slug FROM organizations`);
    const orgMap: Record<string, string> = {};
    orgRes.rows.forEach(r => orgMap[r.slug] = r.id);

    const stateRes = await query(`SELECT id, code, name FROM states`);
    const stateMap: Record<string, string> = {};
    stateRes.rows.forEach(r => {
      stateMap[r.code] = r.id;
      stateMap[r.name] = r.id;
    });

    console.log(`Loaded ${Object.keys(categoryMap).length} categories, ${Object.keys(orgMap).length} organizations, ${Object.keys(stateMap).length} states.`);

    // 2. Comprehensive Exam Catalog
    const examsData = [
      // 1. NEET UG
      {
        slug: 'neet-ug-2027',
        title: 'National Eligibility cum Entrance Test (UG) 2027',
        short_title: 'NEET UG 2027',
        conducting_org_id: orgMap['nta'],
        category_id: categoryMap['medical-entrance'],
        level: 'National',
        stream_eligibility: ['PCB'],
        min_age: 17,
        max_age: null,
        age_relaxation: { 'All Categories': 'No upper age limit as per Supreme Court & NMC directives. Must complete 17 years by Dec 31 of admission year.' },
        eligibility_criteria: 'Passed 10+2 with Physics, Chemistry, Biology/Biotechnology, and English as core subjects with minimum 50% aggregate (40% for SC/ST/OBC-NCL, 45% for PwD). Candidates appearing in Class 12 board exams in 2027 are fully eligible.',
        exam_frequency: 'Once a year (Pen & Paper OMR)',
        official_website_url: 'https://neet.nta.nic.in',
        registration_url: 'https://neet.ntaonline.in',
        syllabus_url: 'https://neet.nta.nic.in/information-bulletin',
        exam_pattern: {
          mode: 'Pen and Paper (OMR Sheet)',
          duration_minutes: 200,
          total_marks: 720,
          negative_marking: '+4 for correct, -1 for incorrect, 0 for unattempted',
          sections: [
            { name: 'Physics (Section A: 35 + Section B: 15/10)', questions: 45, marks: 180 },
            { name: 'Chemistry (Section A: 35 + Section B: 15/10)', questions: 45, marks: 180 },
            { name: 'Botany (Section A: 35 + Section B: 15/10)', questions: 45, marks: 180 },
            { name: 'Zoology (Section A: 35 + Section B: 15/10)', questions: 45, marks: 180 },
          ],
        },
        overview_article: `### What is NEET UG?
The **National Eligibility cum Entrance Test (Undergraduate)**, conducted by the National Testing Agency (NTA), is the apex single-window national entrance examination for admission into undergraduate medical courses including **MBBS, BDS, BAMS, BHMS, BUMS, BSMS**, and **B.Sc Nursing** in all premier institutions across India (including **AIIMS New Delhi, JIPMER Puducherry, AFMC Pune**, and state medical colleges).

### Why NEET UG Matters
With over **24 Lakh aspirants** competing annually for approximately 1,10,000 MBBS and 27,000 BDS seats, NEET UG is the world’s largest single-day competitive medical examination. Admissions across 15% All India Quota (AIQ) and 85% State Quota are allocated solely on the basis of NEET UG Merit Ranks through the Medical Counselling Committee (MCC) and State DME authorities.

### Key Highlights & Rules
- **No Upper Age Limit**: The National Medical Commission (NMC) has removed the upper age bar.
- **Language Mediums**: Conducted in 13 languages (English, Hindi, Assamese, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Urdu).
- **Tie-Breaking Rule**: Highest marks in Biology, followed by Chemistry, Physics, and lowest proportion of incorrect answers.`,
        career_scope: 'Direct admission to MBBS, BDS, BAMS, BHMS, BVSc & AH, B.Sc Nursing. Top graduates proceed to MD/MS/DNB clinical specializations, Armed Forces Medical College (AFMC), or global clinical licensing (USMLE/PLAB).',
        preparation_tips: {
          strategy: [
            'Master NCERT line-by-line for Biology (accounts for 90%+ of NEET questions).',
            'Solve 15+ years of NEET/AIPMT Previous Year Questions (PYQs) under strict 3-hour 20-minute timed conditions.',
            'Practice minimum 100 numerical problems daily across Mechanics, Electrodynamics, and Physical Chemistry.',
            'Maintain an Error Log notebook to record conceptual blunders during weekly full-length mock tests.'
          ],
          books: [
            { subject: 'Biology', book: 'NCERT Biology Class 11 & 12 (Bible of NEET)', author: 'NCERT' },
            { subject: 'Physics', book: 'Concepts of Physics (Vol 1 & 2)', author: 'Dr. H.C. Verma' },
            { subject: 'Chemistry', book: 'Problems in Physical Chemistry & NCERT', author: 'N. Awasthi / NCERT' }
          ]
        },
        cutoffs_info: {
          year: 2026,
          categories: [
            { category: 'UR / EWS (50th Percentile)', cutoff: '720 – 164 Marks' },
            { category: 'OBC / SC / ST (40th Percentile)', cutoff: '163 – 129 Marks' },
            { category: 'UR / EWS - PwD (45th Percentile)', cutoff: '163 – 146 Marks' }
          ],
          notes: 'To secure a Government Medical College (GMC) MBBS seat via 15% AIQ, general category candidates typically require 650+ marks.'
        },
        important_documents: [
          'Scanned passport-size photograph (10 KB to 200 KB) with white background',
          'Postcard size photograph (4"x6") (10 KB to 200 KB)',
          'Candidate signature on white paper with black ink pen (4 KB to 30 KB)',
          'Left and right hand fingers and thumb impressions',
          'Class 10 passing certificate and Class 12 marksheet',
          'Category certificate (SC/ST/OBC-NCL/GEN-EWS) and PwD certificate (if applicable)',
          'Valid photo identity proof (Aadhaar Card, Passport, Voter ID)'
        ],
        faqs: [
          { question: 'Is there any attempt limit for NEET UG?', answer: 'No, there is no restriction on the number of attempts for NEET UG as long as minimum eligibility criteria are met.' },
          { question: 'Can private candidates or open school (NIOS) students appear?', answer: 'Yes, students from NIOS/State Open Schools and private candidates are eligible as per NMC guidelines.' },
          { question: 'Is NEET mandatory for studying MBBS abroad?', answer: 'Yes, qualifying NEET UG is mandatory for Indian citizens intending to pursue undergraduate medical degrees overseas.' }
        ],
        is_featured: true,
      },

      // 2. JEE Main
      {
        slug: 'jee-main-2027',
        title: 'Joint Entrance Examination (Main) 2027',
        short_title: 'JEE Main 2027',
        conducting_org_id: orgMap['nta'],
        category_id: categoryMap['engineering-entrance'],
        level: 'National',
        stream_eligibility: ['PCM'],
        min_age: null,
        max_age: null,
        age_relaxation: { 'All': 'No age limit. Candidates who passed Class 12 in 2025, 2026 or appearing in 2027 are eligible.' },
        eligibility_criteria: 'Passed Class 12 or equivalent with Physics and Mathematics as compulsory subjects along with Chemistry/Biotechnology/Biology/Technical Vocational subject. For NITs/IIITs/CFTIs admission, 75% marks in Class 12 (65% for SC/ST) or top 20 percentile in respective board is required.',
        exam_frequency: 'Twice a year (Session 1 in Jan, Session 2 in April)',
        official_website_url: 'https://jeemain.nta.ac.in',
        registration_url: 'https://jeemain.ntaonline.in',
        syllabus_url: 'https://jeemain.nta.ac.in/syllabus',
        exam_pattern: {
          mode: 'Computer Based Test (CBT)',
          duration_minutes: 180,
          total_marks: 300,
          negative_marking: '+4 for correct, -1 for incorrect (both MCQs and Numerical Value Questions)',
          sections: [
            { name: 'Physics (20 MCQs + 10 Numerical [attempt 5])', questions: 25, marks: 100 },
            { name: 'Chemistry (20 MCQs + 10 Numerical [attempt 5])', questions: 25, marks: 100 },
            { name: 'Mathematics (20 MCQs + 10 Numerical [attempt 5])', questions: 25, marks: 100 },
          ],
        },
        overview_article: `### What is JEE Main?
The **Joint Entrance Examination (Main)** is the premier national gateway for admission to undergraduate engineering programs (B.Tech/B.E., B.Arch, B.Planning) at **31 National Institutes of Technology (NITs), 26 Indian Institutes of Information Technology (IIITs), and 38 Centrally Funded Technical Institutes (CFTIs)**. It also serves as the mandatory qualifying preliminary screening for **JEE Advanced** (for admission to all 23 IITs).

### Exam Structure & Sessions
- Conducted in two separate sessions (Session 1 in January and Session 2 in April) giving students two chances to improve their NTA percentile score.
- The best of the two NTA percentile scores is considered for final All India Ranking (AIR).
- Top 2,50,000 candidates across categories qualify to appear in JEE Advanced.`,
        career_scope: 'Direct admission to premier engineering branches (Computer Science, AI & Data Science, Electronics, Mechanical, Aerospace) across NIT Trichy, NIT Surathkal, IIIT Hyderabad, DTU, NSUT, and BITS-partnered programs.',
        preparation_tips: {
          strategy: [
            'Prioritize high-yield chapters: Calculus, Coordinate Geometry, Modern Physics, Thermodynamics, Coordination Compounds, Organic Reaction Mechanisms.',
            'Solve past 5 years of JEE Main papers session-wise (over 100+ CBT question papers available).',
            'Focus on numerical section accuracy since negative marking applies to numerical response questions as well.'
          ],
          books: [
            { subject: 'Physics', book: 'Concepts of Physics & IE Irodov Selected Problems', author: 'H.C. Verma / I.E. Irodov' },
            { subject: 'Mathematics', book: 'Cengage Mathematics Series (Algebra, Calculus, Coordinate)', author: 'G. Tewani' },
            { subject: 'Chemistry', book: 'Problems in Physical Chemistry & NCERT Chemistry', author: 'N. Awasthi / NCERT' }
          ]
        },
        cutoffs_info: {
          year: 2026,
          categories: [
            { category: 'Common Rank List (General)', cutoff: '93.23 NTA Percentile' },
            { category: 'Gen-EWS', cutoff: '81.32 NTA Percentile' },
            { category: 'OBC-NCL', cutoff: '79.28 NTA Percentile' },
            { category: 'SC', cutoff: '60.09 NTA Percentile' },
            { category: 'ST', cutoff: '46.69 NTA Percentile' }
          ],
          notes: 'Cutoff represents minimum percentile required to qualify for JEE Advanced.'
        },
        important_documents: [
          'Scanned passport photo and signature in JPG/JPEG format',
          'Category Certificate (EWS/OBC-NCL/SC/ST) issued on or after April 1 of previous year',
          'PwD Certificate (if applicable)',
          'Class 10 and Class 12 Roll Number / Marksheet',
          'Aadhaar Card / Government Identity Number for authentication'
        ],
        faqs: [
          { question: 'Is appearing in both sessions compulsory?', answer: 'No. Appearing in one or both sessions is optional. If you appear in both, the highest NTA percentile is considered.' },
          { question: 'Can I choose my preferred exam date and shift?', answer: 'No, exam city is chosen by candidate, but specific shift and date are allocated algorithmically by NTA.' }
        ],
        is_featured: true,
      },

      // 3. JEE Advanced
      {
        slug: 'jee-advanced-2027',
        title: 'Joint Entrance Examination (Advanced) 2027',
        short_title: 'JEE Advanced 2027',
        conducting_org_id: orgMap['iit-gate'],
        category_id: categoryMap['engineering-entrance'],
        level: 'National',
        stream_eligibility: ['PCM'],
        min_age: null,
        max_age: 25,
        age_relaxation: { 'SC/ST/PwD': '5 years relaxation in upper age limit.' },
        eligibility_criteria: 'Must be among top 2,50,000 successful candidates in B.E./B.Tech. Paper of JEE Main 2027. Maximum two attempts in consecutive years permitted.',
        exam_frequency: 'Once a year (Two Compulsory Papers on same day)',
        official_website_url: 'https://jeeadv.ac.in',
        registration_url: 'https://jeeadv.nic.in',
        syllabus_url: 'https://jeeadv.ac.in/syllabus',
        exam_pattern: {
          mode: 'Computer Based Test (Paper 1 & Paper 2 both mandatory)',
          duration_minutes: 360,
          total_marks: 360,
          negative_marking: 'Varies by question type (Single Correct, Multi Correct with partial marking, Matrix Match, Numerical)',
          sections: [
            { name: 'Paper 1 (Physics, Chemistry, Mathematics - Morning Shift)', questions: 51, marks: 180 },
            { name: 'Paper 2 (Physics, Chemistry, Mathematics - Afternoon Shift)', questions: 51, marks: 180 },
          ],
        },
        overview_article: `### What is JEE Advanced?
The **Joint Entrance Examination (Advanced)** is the apex engineering entrance examination in India, conducted by one of the seven zonal IITs (IIT Bombay, IIT Delhi, IIT Kanpur, IIT Kharagpur, IIT Madras, IIT Roorkee, IIT Guwahati) under the guidance of the Joint Admission Board (JAB).

### Gateway to the 23 IITs
JEE Advanced is the sole gateway for admission to undergraduate B.Tech, BS, Dual Degree, and Integrated M.Tech programs across all **23 Indian Institutes of Technology (IITs)**, **IISc Bangalore**, **IIST Thiruvananthapuram**, and **RGIPT**.`,
        career_scope: 'Admission to top global engineering alumni networks (IIT Bombay, IIT Delhi, IIT Madras) with highest global placement packages, research fellowships at MIT/Stanford, and premier startup founding ecosystem.',
        is_featured: true,
      },

      // 4. UPSC CSE
      {
        slug: 'upsc-cse-2027',
        title: 'UPSC Civil Services Examination (IAS/IPS/IFS) 2027',
        short_title: 'UPSC CSE 2027',
        conducting_org_id: orgMap['upsc'],
        category_id: categoryMap['civil-services'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 21,
        max_age: 32,
        age_relaxation: {
          'OBC-NCL': '3 Years (Up to 35 Years, 9 Attempts)',
          'SC / ST': '5 Years (Up to 37 Years, Unlimited Attempts)',
          'PwBD': '10 Years (Up to 42 Years)',
          'Ex-Servicemen': '5 Years Relaxation'
        },
        eligibility_criteria: 'Candidate must hold a Graduate Degree from any recognized university established by an Act of Parliament or State Legislature. Final year degree candidates awaiting final results are eligible to appear for the Preliminary stage.',
        exam_frequency: 'Once a year (3-Tier Annual Cycle)',
        official_website_url: 'https://upsc.gov.in',
        registration_url: 'https://upsconline.nic.in',
        syllabus_url: 'https://upsc.gov.in/examinations/civil-services-examination',
        exam_pattern: {
          mode: 'Offline Pen & Paper (OMR Prelims + Subjective Descriptive Mains + Personality Test)',
          duration_minutes: 1200,
          total_marks: 2025,
          negative_marking: 'Prelims: -0.33 per wrong answer. Mains: Penalty for handwriting/word limits.',
          sections: [
            { name: 'Prelims GS Paper 1 (100 MCQs - Merit)', questions: 100, marks: 200 },
            { name: 'Prelims CSAT Paper 2 (80 MCQs - Qualifying 33%)', questions: 80, marks: 200 },
            { name: 'Mains: 9 Descriptive Papers (Essay, GS 1-4, Optional 1-2, Languages)', questions: 180, marks: 1750 },
            { name: 'Personality Test (Interview at Dholpur House, New Delhi)', questions: 1, marks: 275 },
          ],
        },
        overview_article: `### What is UPSC Civil Services Examination?
The **Civil Services Examination (CSE)** conducted by the Union Public Service Commission is India’s most prestigious competitive examination. It recruits top administrators for the **All India Services** (Indian Administrative Service - IAS, Indian Police Service - IPS, Indian Forest Service - IFoS) and **Central Group A & B Services** (Indian Foreign Service - IFS, Indian Revenue Service - IRS, Indian Audit and Accounts Service - IA&AS, etc.).

### Three Stages of UPSC CSE
1. **Civil Services Preliminary Examination**: Objective screening consisting of GS Paper 1 (Cutoff Decider) and CSAT Paper 2 (Qualifying with 33%).
2. **Civil Services Main Examination**: Written subjective examination consisting of 9 papers (7 for merit ranking + 2 qualifying language papers).
3. **Personality Test / Interview**: Board interview assessing intellectual integrity, critical powers of assimilation, social cohesion, and leadership.`,
        career_scope: 'Appointments to Cabinet Secretary, District Magistrate / Collector, Director General of Police (DGP), Ambassador / High Commissioner, Secretary to Government of India. Pay Level 10 (₹56,100) rising to Pay Level 17 (Apex Scale ₹2,50,000).',
        preparation_tips: {
          strategy: [
            'Build strong foundation via NCERT textbooks (Classes 6 to 12) for History, Geography, Polity, and Economics.',
            'Daily newspaper editorial analysis (The Hindu or The Indian Express) mapped directly to UPSC GS Syllabus.',
            'Regular Mains Answer Writing practice focusing on introduction, multi-dimensional body (PESTLE framework), and constitutional conclusion.',
            'Choose Optional Subject based on syllabus overlap, interest, and availability of quality mentorship.'
          ],
          books: [
            { subject: 'Indian Polity', book: 'Indian Polity for Civil Services', author: 'M. Laxmikanth' },
            { subject: 'Modern History', book: 'A Brief History of Modern India', author: 'Spectrum / Rajiv Ahir' },
            { subject: 'Indian Economy', book: 'Indian Economy', author: 'Ramesh Singh / Nitin Singhania' },
            { subject: 'Geography', book: 'Certificate Physical and Human Geography & NCERTs', author: 'G.C. Leong' },
            { subject: 'Ethics & Integrity', book: 'Lexicon for Ethics, Integrity & Aptitude', author: 'Chronicle Editorial' }
          ]
        },
        cutoffs_info: {
          year: 2026,
          categories: [
            { category: 'General (Prelims GS-1)', cutoff: '75.41 / 200 Marks' },
            { category: 'EWS (Prelims GS-1)', cutoff: '68.02 / 200 Marks' },
            { category: 'OBC (Prelims GS-1)', cutoff: '74.75 / 200 Marks' },
            { category: 'SC (Prelims GS-1)', cutoff: '59.25 / 200 Marks' },
            { category: 'Final Merit (General out of 2025)', cutoff: '953 Marks' }
          ],
          notes: 'CSAT (Paper-II) requires minimum 66.67 marks (33.33%) for evaluation of GS Paper-I.'
        },
        important_documents: [
          'Scanned recent passport size photograph and signature',
          'Valid Government Photo Identity Card (Aadhaar / Passport / Voter ID)',
          'Graduation Degree Certificate / Final Year Bonafide Certificate',
          'Community Certificate (OBC Non-Creamy Layer / EWS / SC / ST) for current financial year'
        ],
        faqs: [
          { question: 'How many attempts are permitted?', answer: 'General: 6 attempts (up to 32 years); OBC: 9 attempts (up to 35 years); SC/ST: Unlimited attempts (up to 37 years).' },
          { question: 'Does appearing in CSAT count as an attempt?', answer: 'Yes. If you appear in even one paper of the Preliminary examination, it is officially counted as an attempt.' }
        ],
        is_featured: true,
      },

      // 5. SSC CGL
      {
        slug: 'ssc-cgl-2027',
        title: 'SSC Combined Graduate Level (CGL) Examination 2027',
        short_title: 'SSC CGL 2027',
        conducting_org_id: orgMap['ssc'],
        category_id: categoryMap['staff-selection'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 18,
        max_age: 32,
        age_relaxation: {
          'OBC': '3 Years',
          'SC / ST': '5 Years',
          'PwD': '10 Years',
          'Ex-Servicemen': '3 Years after deduction of military service'
        },
        eligibility_criteria: 'Bachelor’s Degree in any discipline from a recognized University. For Junior Statistical Officer (JSO), 60% in Mathematics in Class 12th or Bachelor’s with Statistics is required.',
        exam_frequency: 'Once a year (Tier 1 CBT + Tier 2 CBT + DEST Typing)',
        official_website_url: 'https://ssc.gov.in',
        registration_url: 'https://ssc.gov.in/login',
        syllabus_url: 'https://ssc.gov.in/notice-board',
        exam_pattern: {
          mode: 'Computer Based Test (CBT)',
          duration_minutes: 180,
          total_marks: 590,
          negative_marking: 'Tier 1: 0.50 marks per wrong answer. Tier 2: 1 mark per wrong answer.',
          sections: [
            { name: 'Tier 1: Reasoning, GA, Quant, English (100 Qs - Qualifying)', questions: 100, marks: 200 },
            { name: 'Tier 2 Paper 1: Math & Reasoning (60 Qs)', questions: 60, marks: 180 },
            { name: 'Tier 2 Paper 1: English & GA (70 Qs)', questions: 70, marks: 210 },
            { name: 'Tier 2 Paper 1: Computer Knowledge (Qualifying 20 Qs)', questions: 20, marks: 60 },
          ],
        },
        overview_article: `### What is SSC CGL?
The **Staff Selection Commission Combined Graduate Level (SSC CGL)** is the single most sought-after recruitment examination in India for Group 'B' and Group 'C' posts across Ministries, Departments, and Subordinate Offices of the Government of India.

### Top Posts Filled via SSC CGL
- **Assistant Section Officer (ASO)**: Central Secretariat Service (CSS), Intelligence Bureau (IB), Ministry of External Affairs (MEA), Ministry of Railway.
- **Inspectors**: Central Excise & GST Inspector, Preventive Officer, Examiner, Income Tax Inspector (CBDT).
- **Sub-Inspector (SI)**: Central Bureau of Investigation (CBI), National Investigation Agency (NIA), Narcotics Control Bureau (NCB).
- **Auditor & Accountant**: Comptroller and Auditor General (CAG), Controller General of Accounts (CGA).`,
        career_scope: 'Direct appointment into prestigious Central Government ministries with 7th Pay Commission Pay Level 7 (Basic ₹44,900 to ₹1,42,400 + DA + HRA), Pay Level 6, Pay Level 5, and Pay Level 4.',
        is_featured: true,
      },

      // 6. UPSC NDA & NA
      {
        slug: 'upsc-nda-2027',
        title: 'UPSC National Defence Academy & Naval Academy (NDA/NA) 2027',
        short_title: 'NDA 2027',
        conducting_org_id: orgMap['upsc'],
        category_id: categoryMap['defence-services'],
        level: 'National',
        stream_eligibility: ['PCM', 'Any'],
        min_age: 16,
        max_age: 19,
        age_relaxation: { 'All': 'Strict age bracket 16.5 to 19.5 years. Unmarried male and female candidates eligible.' },
        eligibility_criteria: 'For Army Wing: Passed 10+2 in any stream. For Air Force and Navy Wings & Cadet Entry at Naval Academy: Passed 10+2 with Physics, Chemistry, and Mathematics (PCM).',
        exam_frequency: 'Twice a year (NDA-I in April, NDA-II in September)',
        official_website_url: 'https://upsc.gov.in',
        registration_url: 'https://upsconline.nic.in',
        is_featured: true,
      },

      // 7. UPSC CDS
      {
        slug: 'upsc-cds-2027',
        title: 'UPSC Combined Defence Services (CDS) Examination 2027',
        short_title: 'UPSC CDS 2027',
        conducting_org_id: orgMap['upsc'],
        category_id: categoryMap['defence-services'],
        level: 'National',
        stream_eligibility: ['Any', 'PCM'],
        min_age: 19,
        max_age: 24,
        age_relaxation: { 'All': 'Age 19 to 24 for IMA, INA, AFA; up to 25 for OTA (Officers Training Academy).' },
        eligibility_criteria: 'IMA & OTA: Degree of a recognized university in any discipline. INA: Degree in Engineering. AFA: Degree with Physics & Math at 10+2 or Bachelor of Engineering.',
        exam_frequency: 'Twice a year (CDS-I and CDS-II)',
        official_website_url: 'https://upsc.gov.in',
        registration_url: 'https://upsconline.nic.in',
        is_featured: true,
      },

      // 8. IBPS PO
      {
        slug: 'ibps-po-2027',
        title: 'IBPS Probationary Officers / Management Trainees (PO/MT) 2027',
        short_title: 'IBPS PO 2027',
        conducting_org_id: orgMap['ibps'],
        category_id: categoryMap['banking-insurance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 20,
        max_age: 30,
        age_relaxation: { 'OBC': '3 Years', 'SC/ST': '5 Years', 'PwD': '10 Years' },
        eligibility_criteria: 'A Degree (Graduation) in any discipline from a University recognized by the Govt. of India or any equivalent qualification recognized by the Central Government.',
        exam_frequency: 'Once a year (Prelims + Mains + Interview)',
        official_website_url: 'https://ibps.in',
        registration_url: 'https://ibpsonline.ibps.in',
        is_featured: true,
      },

      // 9. SBI PO
      {
        slug: 'sbi-po-2027',
        title: 'State Bank of India Probationary Officer (SBI PO) 2027',
        short_title: 'SBI PO 2027',
        conducting_org_id: orgMap['sbi'],
        category_id: categoryMap['banking-insurance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 21,
        max_age: 30,
        age_relaxation: { 'OBC': '3 Years', 'SC/ST': '5 Years', 'PwD': '10-15 Years' },
        eligibility_criteria: 'Graduation in any discipline from a recognized University or any equivalent qualification recognized by the Central Government. Final year students may also apply provisionally.',
        exam_frequency: 'Once a year',
        official_website_url: 'https://sbi.co.in/careers',
        is_featured: true,
      },

      // 10. RBI Grade B
      {
        slug: 'rbi-grade-b-2027',
        title: 'Reserve Bank of India (RBI) Grade B Officer 2027',
        short_title: 'RBI Grade B 2027',
        conducting_org_id: orgMap['rbi'],
        category_id: categoryMap['banking-insurance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 21,
        max_age: 30,
        age_relaxation: { 'OBC': '3 Years', 'SC/ST': '5 Years', 'M.Phil/Ph.D': 'Up to 32/34 Years' },
        eligibility_criteria: 'Minimum 60% marks (50% for SC/ST/PwBD) in Graduation or 55% in Post-Graduation in any discipline from a recognized University.',
        exam_frequency: 'Once a year (Phase 1 CBT + Phase 2 Descriptive + Interview)',
        official_website_url: 'https://opportunities.rbi.org.in',
        is_featured: true,
      },

      // 11. RRB NTPC
      {
        slug: 'rrb-ntpc-2027',
        title: 'Railway Recruitment Board NTPC (Graduate & 10+2) 2027',
        short_title: 'RRB NTPC 2027',
        conducting_org_id: orgMap['rrb'],
        category_id: categoryMap['railways-rrb'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 18,
        max_age: 33,
        age_relaxation: { 'OBC': '3 Years', 'SC/ST': '5 Years', 'PwBD': '10 Years' },
        eligibility_criteria: 'Graduate posts: Any Bachelor Degree. Undergraduate posts: 12th (+2 Stage) or equivalent with not less than 50% marks in aggregate.',
        exam_frequency: 'Periodic cycle across 21 RRB Zones',
        official_website_url: 'https://rrbapply.gov.in',
        is_featured: true,
      },

      // 12. RRB ALP
      {
        slug: 'rrb-alp-2027',
        title: 'RRB Assistant Loco Pilot (ALP) & Technician 2027',
        short_title: 'RRB ALP 2027',
        conducting_org_id: orgMap['rrb'],
        category_id: categoryMap['railways-rrb'],
        level: 'National',
        stream_eligibility: ['PCM', 'Any'],
        min_age: 18,
        max_age: 30,
        age_relaxation: { 'OBC': '3 Years', 'SC/ST': '5 Years' },
        eligibility_criteria: 'Matriculation / 10th Pass plus ITI in specified trades (Fitter, Electrician, Instrument Mechanic, etc.) OR 3 Years Diploma in Mechanical / Electrical / Electronics Engineering OR B.E./B.Tech.',
        exam_frequency: 'Periodic (CBT-1, CBT-2, CBAT Psycho Test, DV/Medical)',
        official_website_url: 'https://rrbapply.gov.in',
        is_featured: true,
      },

      // 13. GATE
      {
        slug: 'gate-2027',
        title: 'Graduate Aptitude Test in Engineering (GATE) 2027',
        short_title: 'GATE 2027',
        conducting_org_id: orgMap['iit-gate'],
        category_id: categoryMap['engineering-entrance'],
        level: 'National',
        stream_eligibility: ['PCM', 'Any'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Candidates who have completed any government approved degree program in Engineering / Technology / Architecture / Science / Commerce / Arts are eligible to appear for GATE.',
        exam_frequency: 'Once a year (February)',
        official_website_url: 'https://gate.iitk.ac.in',
        is_featured: true,
      },

      // 14. CUET UG
      {
        slug: 'cuet-ug-2027',
        title: 'Common University Entrance Test (CUET UG) 2027',
        short_title: 'CUET UG 2027',
        conducting_org_id: orgMap['nta'],
        category_id: categoryMap['university-entrance'],
        level: 'National',
        stream_eligibility: ['Any', 'PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'For appearing in the CUET (UG), there is no age limit for the candidates. The candidates who have passed the class 12 /equivalent examination or are appearing in 2027 can appear.',
        exam_frequency: 'Once a year (Hybrid CBT & Pen-Paper Mode)',
        official_website_url: 'https://cuetug.ntaonline.in',
        is_featured: true,
      },

      // 15. CLAT UG
      {
        slug: 'clat-ug-2027',
        title: 'Common Law Admission Test (CLAT UG) 2027',
        short_title: 'CLAT UG 2027',
        conducting_org_id: orgMap['consortium-of-nlus'],
        category_id: categoryMap['law-entrance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Candidates must have passed 10+2 or an equivalent examination with a minimum of 45% of marks or its equivalent grade (40% marks in case of candidates belonging to SC/ST categories).',
        exam_frequency: 'Once a year (December for next academic session)',
        official_website_url: 'https://consortiumofnlus.ac.in',
        is_featured: true,
      },

      // 16. CAT
      {
        slug: 'cat-2027',
        title: 'Common Admission Test (CAT) 2027 for IIMs',
        short_title: 'CAT 2027',
        conducting_org_id: orgMap['iim-cat'],
        category_id: categoryMap['management-entrance'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Bachelor’s Degree, with at least 50% marks or equivalent CGPA (45% in case of the candidates belonging to SC, ST and PwD categories) awarded by any recognized University.',
        exam_frequency: 'Once a year (Last Sunday of November)',
        official_website_url: 'https://iimcat.ac.in',
        is_featured: true,
      },

      // 17. CBSE 12th Board
      {
        slug: 'cbse-class-12-board-2027',
        title: 'CBSE Senior School Certificate Examination (Class 12) 2027',
        short_title: 'CBSE Class 12 Board 2027',
        conducting_org_id: orgMap['cbse'],
        category_id: categoryMap['school-boards'],
        level: 'National',
        stream_eligibility: ['PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Regular students enrolled in CBSE-affiliated schools who have completed the prescribed course of study in Class 11 and Class 12, or registered private candidates.',
        exam_frequency: 'Once a year (February to April)',
        official_website_url: 'https://cbse.gov.in',
        is_featured: true,
      },

      // 18. CBSE 10th Board
      {
        slug: 'cbse-class-10-board-2027',
        title: 'CBSE Secondary School Examination (Class 10) 2027',
        short_title: 'CBSE Class 10 Board 2027',
        conducting_org_id: orgMap['cbse'],
        category_id: categoryMap['school-boards'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 14,
        max_age: null,
        eligibility_criteria: 'Regular students enrolled in Class 10 in CBSE-affiliated institutions who have satisfied attendance criteria, or registered private candidates.',
        exam_frequency: 'Once a year (February to March)',
        official_website_url: 'https://cbse.gov.in',
        is_featured: true,
      },

      // 19. MP Board 12th
      {
        slug: 'mp-board-12th-hssc-2027',
        title: 'MP Board Higher Secondary Certificate Exam (Class 12) 2027',
        short_title: 'MP Board 12th (HSSC) 2027',
        conducting_org_id: orgMap['mpbse'],
        category_id: categoryMap['school-boards'],
        level: 'State',
        stream_eligibility: ['PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
        min_age: null,
        max_age: null,
        eligibility_criteria: 'Regular candidates enrolled in MPBSE-affiliated higher secondary schools across Madhya Pradesh or registered private candidates (Swadhyayi).',
        exam_frequency: 'Once a year (February to March)',
        official_website_url: 'https://mpbse.nic.in',
        is_featured: true,
      },

      // 20. MPPSC State Services
      {
        slug: 'mppsc-state-services-2027',
        title: 'MPPSC State Services Examination (SSE) 2027',
        short_title: 'MPPSC SSE 2027',
        conducting_org_id: orgMap['mppsc'],
        category_id: categoryMap['civil-services'],
        level: 'State',
        stream_eligibility: ['Any'],
        min_age: 21,
        max_age: 40,
        age_relaxation: {
          'MP Domicile SC/ST/OBC/Women': '5 Years (up to 45 Years)',
          'Non-Uniformed Posts': '21 to 40 Years',
          'Uniformed Posts (DSP/Jail)': '21 to 33 Years'
        },
        eligibility_criteria: 'Graduate degree in any discipline from a recognized University. Candidates in their final year of graduation are eligible to apply for Prelims. Domicile of MP not mandatory for general category, but reservation benefits apply only to MP residents.',
        exam_frequency: 'Once a year',
        official_website_url: 'https://mppsc.mp.gov.in',
        is_featured: true,
      },

      // 21. UPPSC PCS
      {
        slug: 'uppsc-pcs-2027',
        title: 'UPPSC Combined State / Upper Subordinate Services (PCS) 2027',
        short_title: 'UPPSC PCS 2027',
        conducting_org_id: orgMap['uppsc'],
        category_id: categoryMap['civil-services'],
        level: 'State',
        stream_eligibility: ['Any'],
        min_age: 21,
        max_age: 40,
        age_relaxation: { 'UP SC/ST/OBC': '5 Years Relaxation (Up to 45 Years)', 'PwD': 'Up to 55 Years' },
        eligibility_criteria: 'Bachelor’s degree of any recognized University or equivalent qualification.',
        exam_frequency: 'Once a year (Prelims + Mains + Interview)',
        official_website_url: 'https://uppsc.up.nic.in',
        is_featured: true,
      },

      // 22. BPSC CCE
      {
        slug: 'bpsc-cce-2027',
        title: 'Bihar Public Service Commission Combined Competitive Exam (BPSC CCE) 2027',
        short_title: 'BPSC 71st CCE 2027',
        conducting_org_id: orgMap['bpsc'],
        category_id: categoryMap['civil-services'],
        level: 'State',
        stream_eligibility: ['Any'],
        min_age: 20,
        max_age: 37,
        age_relaxation: { 'BC/EBC (Male/Female)': '40 Years', 'SC/ST': '42 Years', 'General Female': '40 Years' },
        eligibility_criteria: 'Graduation degree from a recognized university or equivalent.',
        exam_frequency: 'Once a year (Prelims with negative marking + Mains + Interview)',
        official_website_url: 'https://bpsc.bih.nic.in',
        is_featured: true,
      },

      // 23. CTET
      {
        slug: 'ctet-2027',
        title: 'Central Teacher Eligibility Test (CTET) 2027',
        short_title: 'CTET 2027',
        conducting_org_id: orgMap['cbse'],
        category_id: categoryMap['teaching-exams'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 18,
        max_age: null,
        eligibility_criteria: 'Paper I (Classes I to V): Senior Secondary with at least 50% marks and 2-year Diploma in Elementary Education (D.El.Ed). Paper II (Classes VI to VIII): Graduation and passed or appearing in final year of 2-year D.El.Ed or B.Ed.',
        exam_frequency: 'Twice a year (July and December)',
        official_website_url: 'https://ctet.nic.in',
        is_featured: true,
      },

      // 24. SSC CHSL
      {
        slug: 'ssc-chsl-2027',
        title: 'SSC Combined Higher Secondary Level (10+2) Examination 2027',
        short_title: 'SSC CHSL 2027',
        conducting_org_id: orgMap['ssc'],
        category_id: categoryMap['staff-selection'],
        level: 'National',
        stream_eligibility: ['Any', 'PCM'],
        min_age: 18,
        max_age: 27,
        age_relaxation: { 'OBC': '3 Years', 'SC/ST': '5 Years', 'PwD': '10 Years' },
        eligibility_criteria: 'Candidates must have passed 12th Standard or equivalent examination from a recognized Board or University. For DEO Grade A in CAG/MoPNG: 12th Standard pass in Science stream with Mathematics.',
        exam_frequency: 'Once a year',
        official_website_url: 'https://ssc.gov.in',
        is_featured: true,
      },

      // 25. SSC GD Constable
      {
        slug: 'ssc-gd-constable-2027',
        title: 'SSC Constable (GD) in CAPFs, SSF, Rifleman in Assam Rifles 2027',
        short_title: 'SSC GD Constable 2027',
        conducting_org_id: orgMap['ssc'],
        category_id: categoryMap['staff-selection'],
        level: 'National',
        stream_eligibility: ['Any'],
        min_age: 18,
        max_age: 23,
        age_relaxation: { 'OBC': '3 Years (26 Years)', 'SC/ST': '5 Years (28 Years)', 'Ex-Servicemen': '3 Years' },
        eligibility_criteria: 'Candidates must have passed Matriculation or 10th Class Examination from a recognized Board/University as on the crucial date.',
        exam_frequency: 'Annual recruitment across BSF, CISF, CRPF, SSB, ITBP, AR, SSF',
        official_website_url: 'https://ssc.gov.in',
        is_featured: true,
      }
    ];

    console.log(`Inserting ${examsData.length} comprehensive exams...`);
    const examMap: Record<string, string> = {};

    for (const ex of examsData) {
      const res = await query(
        `INSERT INTO exams (
          slug, title, short_title, conducting_org_id, category_id, level, stream_eligibility,
          min_age, max_age, age_relaxation, eligibility_criteria, exam_frequency,
          official_website_url, registration_url, syllabus_url, exam_pattern,
          important_documents, faqs, overview_article, career_scope, preparation_tips,
          cutoffs_info, is_featured, is_active, last_verified_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, true, NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          short_title = EXCLUDED.short_title,
          category_id = EXCLUDED.category_id,
          stream_eligibility = EXCLUDED.stream_eligibility,
          eligibility_criteria = EXCLUDED.eligibility_criteria,
          exam_pattern = EXCLUDED.exam_pattern,
          overview_article = EXCLUDED.overview_article,
          career_scope = EXCLUDED.career_scope,
          preparation_tips = EXCLUDED.preparation_tips,
          cutoffs_info = EXCLUDED.cutoffs_info,
          is_featured = EXCLUDED.is_featured,
          last_verified_at = NOW()
        RETURNING id, slug`,
        [
          ex.slug, ex.title, ex.short_title, ex.conducting_org_id, ex.category_id, ex.level,
          JSON.stringify(ex.stream_eligibility), ex.min_age, ex.max_age, JSON.stringify(ex.age_relaxation || {}),
          ex.eligibility_criteria, ex.exam_frequency, ex.official_website_url, ex.registration_url,
          ex.syllabus_url, JSON.stringify(ex.exam_pattern || {}), JSON.stringify(ex.important_documents || []),
          JSON.stringify(ex.faqs || []), ex.overview_article || '', ex.career_scope || '',
          JSON.stringify(ex.preparation_tips || {}), JSON.stringify(ex.cutoffs_info || {}), ex.is_featured
        ]
      );
      examMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 3. Exam Events (Key milestones)
    console.log('🗓️ Seeding Events Timeline for Exams...');
    const events = [
      // NEET UG
      { exam_id: examMap['neet-ug-2027'], cycle_year: 2027, event_type: 'registration', title: 'Online Application Window', start_date: '2027-02-08', end_date: '2027-03-16', is_extended: true, status: 'open', source: 'https://neet.nta.nic.in/notices/ext-2027' },
      { exam_id: examMap['neet-ug-2027'], cycle_year: 2027, event_type: 'correction_window', title: 'Application Form Correction Window', start_date: '2027-03-18', end_date: '2027-03-22', is_extended: false, status: 'upcoming', source: 'https://neet.nta.nic.in' },
      { exam_id: examMap['neet-ug-2027'], cycle_year: 2027, event_type: 'admit_card', title: 'City Intimation & Hall Ticket Release', start_date: '2027-04-28', end_date: null, is_extended: false, status: 'upcoming', source: 'https://neet.nta.nic.in' },
      { exam_id: examMap['neet-ug-2027'], cycle_year: 2027, event_type: 'exam', title: 'NEET UG 2027 Examination (Single Shift)', start_date: '2027-05-02', end_date: '2027-05-02', is_extended: false, status: 'upcoming', source: 'https://neet.nta.nic.in' },
      { exam_id: examMap['neet-ug-2027'], cycle_year: 2027, event_type: 'result', title: 'Declaration of Result & All India Ranks', start_date: null, end_date: null, is_extended: false, status: 'unannounced', source: 'https://neet.nta.nic.in' },

      // JEE Main
      { exam_id: examMap['jee-main-2027'], cycle_year: 2027, event_type: 'registration', title: 'Session 2 Application Window', start_date: '2027-02-01', end_date: '2027-03-02', is_extended: false, status: 'closed', source: 'https://jeemain.nta.ac.in' },
      { exam_id: examMap['jee-main-2027'], cycle_year: 2027, event_type: 'exam', title: 'Session 2 Examination Dates', start_date: '2027-04-01', end_date: '2027-04-08', is_extended: false, status: 'upcoming', source: 'https://jeemain.nta.ac.in' },

      // UPSC CSE
      { exam_id: examMap['upsc-cse-2027'], cycle_year: 2027, event_type: 'registration', title: 'Civil Services (Preliminary) Application Window', start_date: '2027-01-22', end_date: '2027-02-18', is_extended: false, status: 'closed', source: 'https://upsc.gov.in' },
      { exam_id: examMap['upsc-cse-2027'], cycle_year: 2027, event_type: 'exam', title: 'Civil Services (Preliminary) Examination 2027', start_date: '2027-05-23', end_date: '2027-05-23', is_extended: false, status: 'upcoming', source: 'https://upsc.gov.in/calendar' },

      // SSC CGL
      { exam_id: examMap['ssc-cgl-2027'], cycle_year: 2027, event_type: 'registration', title: 'Online Registration Window', start_date: '2027-04-01', end_date: '2027-04-30', is_extended: false, status: 'upcoming', source: 'https://ssc.gov.in' },
      { exam_id: examMap['ssc-cgl-2027'], cycle_year: 2027, event_type: 'exam', title: 'Tier-1 Computer Based Examination', start_date: '2027-07-15', end_date: '2027-07-28', is_extended: false, status: 'upcoming', source: 'https://ssc.gov.in' },
    ];

    for (const ev of events) {
      if (!ev.exam_id) continue;
      await query(
        `INSERT INTO exam_events (exam_id, cycle_year, event_type, title, start_date, end_date, is_extended, status, official_source_url, last_verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (exam_id, cycle_year, event_type) DO UPDATE SET
           title = EXCLUDED.title,
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           is_extended = EXCLUDED.is_extended,
           status = EXCLUDED.status,
           official_source_url = EXCLUDED.official_source_url,
           last_verified_at = NOW()`,
        [ev.exam_id, ev.cycle_year, ev.event_type, ev.title, ev.start_date, ev.end_date, ev.is_extended, ev.status, ev.source]
      );
    }

    // 4. Seeding Government Job Vacancies (Sarkari Naukri) & Prestigious Internships & Scholarships
    console.log('💼 Seeding Government Job Vacancies, National Internships, and Scholarships...');
    const opportunitiesData = [
      // JOBS
      {
        slug: 'ssc-cgl-recruitment-2026',
        title: 'SSC CGL 2026 Recruitment (Group B & C Central Ministries)',
        org_id: orgMap['ssc'],
        opp_type: 'job',
        vacancies_count: '14,582 Vacancies',
        salary_range: 'Pay Level 4 to 8: ₹25,500 – ₹1,51,100 + DA & HRA',
        department: 'Central Ministries, CBDT, CBIC, CSS, IB, MEA, CAG',
        role_designation: 'Assistant Section Officer (ASO), Inspector of Income Tax, Central Excise Inspector, Auditor',
        qualification: 'Bachelor’s Degree in any discipline from a recognized University',
        min_age: 18,
        max_age: 32,
        location: 'All India & Central Secretariat (New Delhi)',
        stream: ['Any'],
        application_start: '2026-06-24',
        application_deadline: '2026-07-24',
        is_deadline_extended: false,
        benefits: 'Central Govt Pension (NPS), CGHS Medical Cover, LTC, HRA up to 30%, Transport Allowance, Stable Gazetted & Non-Gazetted Career.',
        financial_aid_amount: 'Monthly In-Hand: ₹42,000 to ₹88,000 (Based on City Tier & Pay Level)',
        description: 'Staff Selection Commission (SSC) invites online applications for Combined Graduate Level Examination (CGL) 2026 to fill 14,582 vacancies for Group B and Group C posts in various Ministries/Departments/Organizations of the Government of India.',
        eligibility: 'Must be a Citizen of India holding a Graduation degree. Age 18-30/32 with standard category relaxation (OBC: 3 yrs, SC/ST: 5 yrs, PwD: 10 yrs).',
        application_process: 'Apply online through the one-time registration portal on ssc.gov.in. Upload live webcam photograph, signature, and select regional exam centres.',
        official_source_url: 'https://ssc.gov.in/notice-board',
        official_portal_link: 'https://ssc.gov.in',
        documents_required: ['Graduation Marksheets', 'Category Certificate (OBC/EWS/SC/ST)', 'Live Photograph via SSC App', 'Aadhaar Card'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'upsc-cse-recruitment-2026',
        title: 'UPSC Civil Services (IAS / IPS / IFS) Recruitment 2026',
        org_id: orgMap['upsc'],
        opp_type: 'job',
        vacancies_count: '1,056 Posts',
        salary_range: 'Pay Level 10: ₹56,100 – ₹1,77,500 + DA + Free Housing & Perks',
        department: 'DoPT, Ministry of Home Affairs, Ministry of External Affairs',
        role_designation: 'Sub-Divisional Magistrate (SDM), Assistant Superintendent of Police (ASP), Third Secretary (IFS)',
        qualification: 'Graduate degree in any stream (BA, B.Sc, B.Tech, B.Com, MBBS, LLB)',
        min_age: 21,
        max_age: 32,
        location: 'All India Cadres & Diplomatic Missions Overseas',
        stream: ['Any'],
        application_start: '2026-01-22',
        application_deadline: '2026-02-18',
        is_deadline_extended: false,
        benefits: 'Apex administrative leadership in Government of India, official residence, vehicle with security, diplomatic passports, discretionary executive powers.',
        financial_aid_amount: 'Starting In-Hand ~₹82,000/mo + Government Accommodation & Facilities',
        description: 'Recruitment for 1,056 vacancies across Indian Administrative Service (180), Indian Police Service (200), Indian Foreign Service (40), and Group A Central Services.',
        eligibility: 'Age 21-32 on 1st August. Degree from recognized university. 6 attempts for General, 9 for OBC, unlimited for SC/ST.',
        application_process: 'One Time Registration (OTR) on upsconline.nic.in followed by Part I and Part II application.',
        official_source_url: 'https://upsc.gov.in',
        official_portal_link: 'https://upsconline.nic.in',
        documents_required: ['Graduation Degree / Final Year Proof', 'Govt Photo ID (Aadhaar/Passport)', 'Caste/EWS Certificate'],
        status: 'closed',
        is_featured: true,
      },
      {
        slug: 'rrb-ntpc-recruitment-2026',
        title: 'Indian Railways RRB NTPC Recruitment 2026 (11,558 Posts)',
        org_id: orgMap['rrb'],
        opp_type: 'job',
        vacancies_count: '11,558 Posts',
        salary_range: 'Pay Level 2 to Level 6: ₹19,900 – ₹92,300 + Railway Free Travel Pass',
        department: 'Ministry of Railways (21 Railway Recruitment Boards)',
        role_designation: 'Station Master, Goods Train Manager, Chief Commercial cum Ticket Supervisor, Junior Clerk',
        qualification: 'Graduate for Level 5/6; 12th Pass with min 50% for Level 2/3',
        min_age: 18,
        max_age: 33,
        location: 'Pan-India Railway Zones & Divisions',
        stream: ['Any'],
        application_start: '2026-09-14',
        application_deadline: '2026-10-13',
        is_deadline_extended: false,
        benefits: 'Railway family medical pass, complimentary 1st/2nd AC railway travel passes, running allowance for operating staff, railway quarters.',
        financial_aid_amount: 'Monthly In-Hand: ₹32,000 to ₹65,000 (Plus Mileage/Running Allowance)',
        description: 'Indian Railways invites applications across 21 RRBs for 11,558 vacancies in Non-Technical Popular Categories (NTPC).',
        eligibility: 'Citizen of India. 18 to 33 years for Graduate posts with 3-year COVID age relaxation benefit.',
        application_process: 'Apply online via unified RRB portal (rrbapply.gov.in) with Aadhaar verification.',
        official_source_url: 'https://rrbapply.gov.in',
        official_portal_link: 'https://rrbapply.gov.in',
        documents_required: ['10th Marksheet for DOB', '12th / Degree Certificate', 'SC/ST/OBC Certificate', 'Scanned Photo & Signature'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'rrb-alp-recruitment-2026',
        title: 'Railway Assistant Loco Pilot (ALP) Recruitment 2026 (18,799 Posts)',
        org_id: orgMap['rrb'],
        opp_type: 'job',
        vacancies_count: '18,799 Posts',
        salary_range: 'Pay Level 2: ₹19,900 + Running Allowance (Kilo-metre Allowance)',
        department: 'Indian Railways (Mechanical & Electrical Loco Running Cadre)',
        role_designation: 'Assistant Loco Pilot (Electric & Diesel Locomotives)',
        qualification: '10th Pass + ITI in relevant trade OR 3-Year Diploma / Degree in Mechanical/Electrical/Electronics',
        min_age: 18,
        max_age: 30,
        location: 'All Railway Zones',
        stream: ['PCM', 'Any'],
        application_start: '2026-01-20',
        application_deadline: '2026-02-19',
        is_deadline_extended: false,
        benefits: 'High mileage running allowance (average ₹20,000–₹35,000 extra per month), Railway Hospital facility, Free travel passes.',
        financial_aid_amount: 'Total Monthly Earnings: ₹45,000 to ₹62,000 (Basic + DA + Running Allowances)',
        description: 'Mega recruitment of 18,799 Assistant Loco Pilots to pilot passenger, mail/express, and freight trains across Indian Railways network.',
        eligibility: 'Must satisfy Medical Standard A-1 (6/6 vision without glasses, no color blindness). ITI/Diploma/B.Tech required.',
        application_process: 'Apply via rrbapply.gov.in.',
        official_source_url: 'https://rrbapply.gov.in',
        documents_required: ['ITI / Diploma / B.Tech Certificate', 'Medical Fitness Certificate', 'Aadhaar Card'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'ibps-po-recruitment-2026',
        title: 'IBPS PO / Management Trainee XIV (4,455 Vacancies)',
        org_id: orgMap['ibps'],
        opp_type: 'job',
        vacancies_count: '4,455 Posts',
        salary_range: 'Basic Pay ₹48,480 + DA (15.7%) + Special Allowance + HRA/Lease',
        department: '11 Public Sector Banks (Bank of Baroda, PNB, Canara Bank, Union Bank, etc.)',
        role_designation: 'Probationary Officer / Assistant Manager (Scale 1)',
        qualification: 'Any Graduation Degree from recognized University',
        min_age: 20,
        max_age: 30,
        location: 'All Public Sector Bank branches nationwide',
        stream: ['Any'],
        application_start: '2026-08-01',
        application_deadline: '2026-08-28',
        is_deadline_extended: true,
        benefits: 'Bank leased accommodation (up to ₹25,000/mo in Tier 1 cities), concessional home/car loans, festival advance, medical reimbursement for family.',
        financial_aid_amount: 'Gross Monthly Salary: ~₹65,000 - ₹72,000 + Bank Leased Quarters',
        description: 'Institute of Banking Personnel Selection invites graduates to join as Probationary Officers across 11 nationalized public sector banks.',
        eligibility: 'Age 20-30 years. Any recognized graduation degree.',
        application_process: 'Register on ibps.in, pay application fee, and submit online.',
        official_source_url: 'https://ibps.in',
        documents_required: ['Graduation Marksheet', 'Handwritten Declaration', 'Left Thumb Impression', 'Photo & Signature'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'isro-scientist-engineer-sc-2026',
        title: 'ISRO ICRB Scientist / Engineer \'SC\' Recruitment 2026',
        org_id: orgMap['isro'],
        opp_type: 'job',
        vacancies_count: '303 Posts',
        salary_range: 'Pay Level 10: ₹56,100 – ₹1,77,500 + Special Allowance',
        department: 'Department of Space, Government of India',
        role_designation: 'Scientist / Engineer \'SC\' (Electronics, Mechanical, Computer Science)',
        qualification: 'B.E./B.Tech or equivalent in first class with aggregate minimum 65% marks or CGPA 6.84/10',
        min_age: 18,
        max_age: 28,
        location: 'ISRO Centres (ISAC Bengaluru, VSSC Thiruvananthapuram, SDSC Sriharikota, SAC Ahmedabad)',
        stream: ['PCM'],
        application_start: '2026-05-25',
        application_deadline: '2026-06-16',
        is_deadline_extended: false,
        benefits: 'Direct involvement in Indian Space Program (Chandrayaan, Gaganyaan, Aditya-L1), ISRO residential colonies, advanced research facilities, CHSS health scheme.',
        financial_aid_amount: 'Starting In-Hand ~₹85,000/month + Space Scientist Perks',
        description: 'ISRO Centralised Recruitment Board (ICRB) recruits premier engineering graduates for satellite launch vehicle design, propulsion, and space computing.',
        eligibility: 'B.E/B.Tech in ECE, Mech, or CSE with 65%+. Age max 28 with standard relaxations.',
        application_process: 'Apply online at isro.gov.in/Careers.html.',
        official_source_url: 'https://isro.gov.in/Careers.html',
        documents_required: ['B.Tech Degree Certificate & All Semester Marksheets', 'Category Proof', 'Valid ID Proof'],
        status: 'open',
        is_featured: true,
      },

      // INTERNSHIPS
      {
        slug: 'rbi-summer-internship-2026',
        title: 'Reserve Bank of India (RBI) Summer Internship Scheme 2026',
        org_id: orgMap['rbi'],
        opp_type: 'internship',
        vacancies_count: '125 Interns',
        stipend_amount: '₹45,000 / Month Stipend',
        salary_range: '₹45,000 / month + Office facilities',
        department: 'Reserve Bank of India (Central Office Mumbai & Regional Offices)',
        role_designation: 'Summer Research Intern (Monetary Policy, FinTech, Banking Regulation)',
        qualification: 'Post-Graduate students in Economics, Finance, Management, Data Science, Law, or 5-Year Integrated Course',
        min_age: 20,
        max_age: 28,
        location: 'Mumbai, New Delhi, Kolkata, Chennai, Bengaluru',
        stream: ['Commerce', 'Arts/Humanities', 'PCM', 'Any'],
        application_start: '2026-09-15',
        application_deadline: '2026-12-15',
        is_deadline_extended: false,
        benefits: 'Prestigious stipend of ₹45,000 per month for 3 months, direct mentorship under RBI economists, access to central banking data sets, certificate of research completion.',
        financial_aid_amount: '₹45,000 per month (Total ₹1,35,000 for 3 months)',
        description: 'The Reserve Bank of India offers summer placement opportunities to domestic students pursuing postgraduate courses or 5-year integrated degrees in prestigious institutions.',
        eligibility: 'Enrolled in post-graduate degree in Economics / Commerce / Finance / Management / Law / Computer Applications / B.Tech Data Science.',
        application_process: 'Submit online application through RBI portal with recommendation letter from College Principal/Dean.',
        official_source_url: 'https://opportunities.rbi.org.in',
        official_portal_link: 'https://opportunities.rbi.org.in/scripts/summer.aspx',
        documents_required: ['College Bonafide Certificate', 'Letter of Recommendation (LOR)', 'CV / Statement of Purpose'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'niti-aayog-internship-scheme-2026',
        title: 'NITI Aayog National Policy & Governance Internship Scheme',
        org_id: orgMap['niti-aayog'],
        opp_type: 'internship',
        vacancies_count: 'Continuous Monthly Batches',
        stipend_amount: 'Unpaid (Honorary with Apex Experience & Certificate)',
        salary_range: 'Prestige Certificate from NITI Aayog + Policy Mentorship',
        department: 'NITI Aayog (Govt of India Think Tank), New Delhi',
        role_designation: 'Policy Research Intern (Health, Education, Agriculture, Electric Mobility, AI)',
        qualification: 'Undergraduate (Completed 2nd Year), Graduate, or Research Scholar in any recognized university',
        min_age: 19,
        max_age: 30,
        location: 'NITI Bhawan, Sansad Marg, New Delhi / Hybrid',
        stream: ['Any'],
        application_start: '2026-01-01',
        application_deadline: '2026-12-31',
        is_deadline_extended: false,
        benefits: 'Work directly on flagship national transformation policies, interact with Cabinet Ministers & Secretaries, experience certificate signed by Adviser/Joint Secretary.',
        financial_aid_amount: 'Experience & Network with Top Indian Policymakers',
        description: 'NITI Aayog Internship Scheme allows students to interact with policy verticals and contribute empirical analysis and research inputs for national development.',
        eligibility: 'Students pursuing UG/PG with minimum 85% marks in Class 12th.',
        application_process: 'Online application window opens between 1st to 10th of every month on niti.gov.in.',
        official_source_url: 'https://niti.gov.in/internship',
        official_portal_link: 'https://niti.gov.in/internship',
        documents_required: ['NOC from Head of Institution', 'Marksheets', 'CV'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'mea-internship-programme-2026',
        title: 'Ministry of External Affairs (MEA) Diplomatic Internship Programme',
        org_id: orgMap['mea-india'],
        opp_type: 'internship',
        vacancies_count: '60 Interns per term (Term I & II)',
        stipend_amount: '₹10,000 / Month + Return Airfare',
        salary_range: '₹10,000 / month + Air Travel Assistance',
        department: 'Ministry of External Affairs, South Block & Jawaharlal Nehru Bhawan, New Delhi',
        role_designation: 'Diplomatic & Foreign Relations Research Intern',
        qualification: 'Graduate degree from a recognized university or in final year of undergraduate program',
        min_age: 20,
        max_age: 27,
        location: 'New Delhi (MEA Headquarters)',
        stream: ['Any'],
        application_start: '2026-01-01',
        application_deadline: '2026-01-14',
        is_deadline_extended: false,
        benefits: 'Stipend of ₹10,000 per month, cost of one-time round-trip airfare from state capital to New Delhi, access to MEA Library and foreign policy briefings.',
        financial_aid_amount: '₹10,000/month + Free Return Airfare',
        description: 'MEA internship aims to bring foreign policy closer to people, impart training in diplomacy, foreign economic relations, and strategic territorial divisions.',
        eligibility: 'Indian citizen holding graduate degree or in final year.',
        application_process: 'Apply online on internship.mea.gov.in.',
        official_source_url: 'https://internship.mea.gov.in',
        documents_required: ['College Verification Form', 'Degree Certificate', 'Photo ID'],
        status: 'closed',
        is_featured: true,
      },
      {
        slug: 'parliamentary-research-internship-pride-2026',
        title: 'Lok Sabha / Parliamentary Research Internship (PRIDE) 2026',
        org_id: orgMap['parliament-india'],
        opp_type: 'internship',
        vacancies_count: '50 Interns',
        stipend_amount: '₹25,000 / Month Stipend',
        salary_range: '₹25,000 / month + Parliament House Pass',
        department: 'Parliament of India (Lok Sabha Secretariat), New Delhi',
        role_designation: 'Parliamentary Research & Legislative Intern',
        qualification: 'Graduation in Social Sciences, Law, Public Policy, Journalism, or Humanities with minimum 55% marks',
        min_age: 21,
        max_age: 30,
        location: 'Parliament House Complex, New Delhi',
        stream: ['Arts/Humanities', 'Commerce', 'Any'],
        application_start: '2026-04-01',
        application_deadline: '2026-05-15',
        is_deadline_extended: false,
        benefits: 'Stipend of ₹25,000/month for 3 months, access to Parliament Library (second largest in India), training in drafting legislative briefs, certificate.',
        financial_aid_amount: '₹25,000 per month (Total ₹75,000)',
        description: 'PRIDE organizes internships to provide young researchers with in-depth knowledge of parliamentary democracy, legislative process, and committee procedures.',
        eligibility: 'Postgraduates or final year graduates in relevant disciplines.',
        application_process: 'Send application with SOP to pride@sansad.nic.in.',
        official_source_url: 'https://sansad.in/ls',
        documents_required: ['Statement of Purpose', 'Two Academic References', 'Degree Marksheets'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'isro-student-internship-program-2026',
        title: 'ISRO Student Internship & Young Scientist Training 2026',
        org_id: orgMap['isro'],
        opp_type: 'internship',
        vacancies_count: '200+ Projects',
        stipend_amount: 'Free High-Tech Lab Access & Mentorship',
        salary_range: 'ISRO Official Certificate & Research Mentorship',
        department: 'Indian Space Research Organisation (VSSC, SAC, URSC, NRSC)',
        role_designation: 'Space Technology Student Intern (Robotics, Satellites, AI)',
        qualification: 'B.E./B.Tech (min 6th sem), M.E./M.Tech, M.Sc (Physics/Maths) with minimum 70% or CGPA 7.5/10',
        min_age: 19,
        max_age: 26,
        location: 'Bengaluru, Thiruvananthapuram, Ahmedabad, Hyderabad',
        stream: ['PCM'],
        application_start: '2026-02-01',
        application_deadline: '2026-03-31',
        is_deadline_extended: false,
        benefits: 'Direct work on ISRO space missions, guidance from senior scientists, certificate of project completion for academic credit.',
        financial_aid_amount: 'Direct Academic Credit & Space Research Credentials',
        description: 'ISRO centres offer internship opportunities to engineering and science students for working on satellite payloads, propulsion systems, and telemetry data analysis.',
        eligibility: 'Engineering/Science students with 70%+ from AICTE/UGC recognized universities.',
        application_process: 'Apply through specific ISRO centre portals with Principal/HOD endorsement.',
        official_source_url: 'https://isro.gov.in/Careers.html',
        documents_required: ['College Bonafide Certificate', 'Resume', 'Marksheets'],
        status: 'open',
        is_featured: true,
      },

      // SCHOLARSHIPS
      {
        slug: 'nsp-central-sector-scholarship-2027',
        title: 'National Scholarship Portal - Central Sector Scheme for College Students 2027',
        org_id: orgMap['nsp-portal'],
        opp_type: 'scholarship',
        vacancies_count: '82,000 Scholarships Annually (41,000 Boys + 41,000 Girls)',
        stipend_amount: '₹12,000 to ₹20,000 / Year',
        salary_range: '₹12,000/yr (UG) & ₹20,000/yr (PG)',
        department: 'Department of Higher Education, Ministry of Education, Govt of India',
        role_designation: 'Central Sector Scheme Scholar',
        qualification: 'Class 12th passed in top 20th percentile of respective board with family income < ₹4.5 Lakh/yr',
        min_age: 17,
        max_age: 25,
        location: 'All India',
        stream: ['PCM', 'PCB', 'Commerce', 'Arts/Humanities', 'Any'],
        application_start: '2026-07-01',
        application_deadline: '2027-03-31',
        is_deadline_extended: true,
        benefits: '₹12,000 per annum for undergraduate study (3 years) and ₹20,000 per annum for postgraduate study (2 years). Disbursed directly via DBT into Aadhaar-seeded bank account.',
        financial_aid_amount: 'Up to ₹76,000 Total Direct Cash Grant across 5 Years',
        description: 'The Central Sector Scheme of Scholarship for College and University Students provides financial assistance to meritorious students from poor families to meet their day-to-day expenses while pursuing higher studies.',
        eligibility: 'Above 80th percentile in Class 12 board exams, pursuing regular degree course, family annual income under ₹4,50,000.',
        application_process: 'Apply online on National Scholarship Portal (scholarships.gov.in) with OTR authentication.',
        official_source_url: 'https://scholarships.gov.in',
        official_portal_link: 'https://scholarships.gov.in',
        documents_required: ['Class 12 Marksheet', 'Income Certificate issued by competent revenue authority', 'Aadhaar Card', 'Bank Passbook'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'inspire-she-scholarship-dst-2027',
        title: 'INSPIRE Scholarship for Higher Education (SHE) - DST India 2027',
        org_id: orgMap['dst-india'],
        opp_type: 'scholarship',
        vacancies_count: '10,000 Scholarships Annually',
        stipend_amount: '₹80,000 / Year',
        salary_range: '₹80,000 / annum (₹60,000 scholarship + ₹20,000 mentorship)',
        department: 'Department of Science and Technology, Ministry of Science & Technology',
        role_designation: 'INSPIRE SHE Scholar',
        qualification: 'Class 12 passed in top 1% of state/central board enrolled in B.Sc, B.S., Int. M.Sc in Natural & Basic Sciences',
        min_age: 17,
        max_age: 22,
        location: 'All India',
        stream: ['PCM', 'PCB'],
        application_start: '2026-09-01',
        application_deadline: '2027-04-30',
        is_deadline_extended: false,
        benefits: 'Total scholarship value of ₹80,000 per annum (₹5,000 per month cash deposit + ₹20,000 summer research project grant under an approved scientist).',
        financial_aid_amount: '₹80,000 / Year (₹4,00,000 total for 5-year Integrated M.Sc)',
        description: 'Innovation in Science Pursuit for Inspired Research (INSPIRE) is an innovative programme sponsored and managed by DST to attract talent to the study of science and careers with research.',
        eligibility: 'Top 1% in Class 12 Boards or Rank within top 10,000 in JEE/NEET, studying basic/natural sciences (Physics, Chemistry, Maths, Biology, Astronomy, Geology, Statistics).',
        application_process: 'Register on online-inspire.gov.in and submit application with advisory note from school board.',
        official_source_url: 'https://online-inspire.gov.in',
        official_portal_link: 'https://online-inspire.gov.in',
        documents_required: ['Class 12 Marksheet', 'INSPIRE Advisory Note', 'College Enrollment Certificate', 'SBI Bank Account'],
        status: 'open',
        is_featured: true,
      },
      {
        slug: 'pmss-scholarship-scheme-2027',
        title: 'Prime Minister’s Scholarship Scheme (PMSS) for Wards of Ex-Servicemen & CAPFs',
        org_id: orgMap['nsp-portal'],
        opp_type: 'scholarship',
        vacancies_count: '5,500 New Scholarships Annually',
        stipend_amount: '₹36,000 / Year (Girls) & ₹30,000 / Year (Boys)',
        salary_range: '₹3,000/month for girls, ₹2,500/month for boys',
        department: 'Welfare and Rehabilitation Board (WARB), Ministry of Home Affairs / MoD',
        role_designation: 'PMSS Scholar',
        qualification: 'First year admission in technical/professional degree (B.Tech, MBBS, BDS, B.Pharm, BBA, BCA, MBA) with min 60% in 12th/Diploma',
        min_age: 17,
        max_age: 25,
        location: 'All India',
        stream: ['Any'],
        application_start: '2026-07-15',
        application_deadline: '2027-01-15',
        is_deadline_extended: false,
        benefits: '₹36,000/yr for female candidates and ₹30,000/yr for male candidates for the entire duration of professional course.',
        financial_aid_amount: '₹30,000 to ₹36,000 per year',
        description: 'Financial support to dependent wards & widows of Ex-Servicemen and Central Armed Police Forces & Assam Rifles personnel.',
        eligibility: 'Wards of deceased/ex-servicemen and CAPF personnel studying recognized professional degree.',
        application_process: 'Apply via NSP portal under WARB / Kendriya Sainik Board section.',
        official_source_url: 'https://scholarships.gov.in',
        documents_required: ['ESM / CAPF Service Certificate', 'Discharge Book', 'PPO Copy', '12th Marksheet'],
        status: 'open',
        is_featured: true,
      }
    ];

    console.log(`Inserting ${opportunitiesData.length} opportunities (Jobs, Internships, Scholarships)...`);
    const oppMap: Record<string, string> = {};

    for (const opp of opportunitiesData) {
      const res = await query(
        `INSERT INTO opportunities (
          slug, title, org_id, opp_type, description, eligibility, qualification, min_age, max_age,
          location, stream, application_start, application_deadline, is_deadline_extended, benefits,
          financial_aid_amount, vacancies_count, salary_range, stipend_amount, department,
          role_designation, application_process, official_source_url, official_portal_link,
          documents_required, status, is_featured, last_verified_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          opp_type = EXCLUDED.opp_type,
          vacancies_count = EXCLUDED.vacancies_count,
          salary_range = EXCLUDED.salary_range,
          stipend_amount = EXCLUDED.stipend_amount,
          department = EXCLUDED.department,
          role_designation = EXCLUDED.role_designation,
          description = EXCLUDED.description,
          eligibility = EXCLUDED.eligibility,
          benefits = EXCLUDED.benefits,
          financial_aid_amount = EXCLUDED.financial_aid_amount,
          application_deadline = EXCLUDED.application_deadline,
          status = EXCLUDED.status,
          is_featured = EXCLUDED.is_featured,
          last_verified_at = NOW()
        RETURNING id, slug`,
        [
          opp.slug, opp.title, opp.org_id, opp.opp_type, opp.description, opp.eligibility, opp.qualification,
          opp.min_age, opp.max_age, opp.location, JSON.stringify(opp.stream || ['Any']),
          opp.application_start, opp.application_deadline, opp.is_deadline_extended, opp.benefits,
          opp.financial_aid_amount, opp.vacancies_count || null, opp.salary_range || null, opp.stipend_amount || null,
          opp.department || null, opp.role_designation || null, opp.application_process,
          opp.official_source_url, opp.official_portal_link || opp.official_source_url,
          JSON.stringify(opp.documents_required || []), opp.status, opp.is_featured
        ]
      );
      oppMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 5. Seeding Daily GK Capsules & Study Materials
    console.log('📰 Seeding Daily GK Capsules for Competitive Exams...');
    const gkCapsules = [
      {
        title: 'ISRO Chandrayaan-4 Lunar Sample Return Mission Architecture Approved',
        category: 'Science & Tech',
        summary: 'Union Cabinet chaired by Prime Minister approves Chandrayaan-4 mission aimed at landing on the moon, collecting lunar soil samples, and returning safely to Earth.',
        relevant_exams: ['UPSC CSE', 'SSC CGL', 'NDA', 'CDS', 'State PSCs'],
        key_takeaways: [
          'Chandrayaan-4 involves 5 major spacecraft modules (Ascender, Descender, Re-entry, Transfer, and Propulsion).',
          'Docking in lunar orbit is a key technological milestone before sample return.',
          'Nodal agency: ISRO under Department of Space.'
        ],
        source_url: 'https://pib.gov.in',
      },
      {
        title: '7th Pay Commission: Dearness Allowance (DA) Hike & HRA City Reclassification',
        category: 'Economy',
        summary: 'Department of Expenditure notifies 50% DA threshold triggering automatic revision of House Rent Allowance (HRA) to 30% (X class), 20% (Y class), and 10% (Z class) cities.',
        relevant_exams: ['UPSC', 'SSC CGL', 'IBPS PO', 'RRB NTPC'],
        key_takeaways: [
          'DA touches 50% of Basic Pay for Central Government Employees.',
          'HRA rates automatically elevated by 3%, 2%, and 1% across X, Y, Z cities.',
          'Children Education Allowance (CEA) limit increased by 25%.'
        ],
        source_url: 'https://doe.gov.in',
      },
      {
        title: 'Supreme Court Ruling on Sub-Classification of Scheduled Castes (SC/ST) Quota',
        category: 'National & Polity',
        summary: 'A 7-judge Constitution Bench of the Supreme Court of India rules 6:1 that State Governments possess constitutional power to create sub-quotas within SC and ST categories.',
        relevant_exams: ['UPSC CSE', 'CLAT PG', 'UPPSC', 'MPPSC', 'BPSC'],
        key_takeaways: [
          'Overrules the 2004 E.V. Chinnaiah judgment.',
          'States must base sub-classification on empirical data proving backwardness.',
          'Creamy layer principle discussed in separate concurring opinions.'
        ],
        source_url: 'https://main.sci.gov.in',
      },
      {
        title: 'Unified Payments Interface (UPI) Expands to 7 New International Destinations',
        category: 'Economy & Banking',
        summary: 'National Payments Corporation of India (NPCI International) integrates instant cross-border retail payments across UAE, Singapore, France, Mauritius, Nepal, Bhutan, and Sri Lanka.',
        relevant_exams: ['IBPS PO', 'SBI PO', 'RBI Grade B', 'SSC CGL'],
        key_takeaways: [
          'NPCI International Payments Limited (NIPL) leads global expansion.',
          'Facilitates QR-code based instant INR payments for Indian tourists and diaspora.'
        ],
        source_url: 'https://rbi.org.in',
      }
    ];

    for (const gk of gkCapsules) {
      await query(
        `INSERT INTO daily_gk_capsules (title, summary, category, relevant_exams, key_takeaways, source_url, published_date)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
         ON CONFLICT DO NOTHING`,
        [gk.title, gk.summary, gk.category, JSON.stringify(gk.relevant_exams), JSON.stringify(gk.key_takeaways), gk.source_url]
      );
    }

    console.log('🎉 Comprehensive Database Seeding Finished Successfully!');
  } catch (err: any) {
    console.error('Error in seeding:', err);
    throw err;
  }
}

seedFullDatabase().then(() => {
  console.log('Seeder completed.');
  process.exit(0);
}).catch((e) => {
  console.error('Seeder failed:', e);
  process.exit(1);
});
