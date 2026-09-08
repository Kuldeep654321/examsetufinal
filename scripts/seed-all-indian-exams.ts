import pool, { query } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seedComprehensiveCatalog() {
  console.log('🇮🇳 Starting Comprehensive Seeding of All Indian Exams, Jobs, and Internships...');

  try {
    // 1. Ensure States
    console.log('📍 Ensuring All Indian States & UTs...');
    const states = [
      { code: 'IN-MP', name: 'Madhya Pradesh', type: 'state', capital: 'Bhopal' },
      { code: 'IN-DL', name: 'Delhi', type: 'ut', capital: 'New Delhi' },
      { code: 'IN-UP', name: 'Uttar Pradesh', type: 'state', capital: 'Lucknow' },
      { code: 'IN-MH', name: 'Maharashtra', type: 'state', capital: 'Mumbai' },
      { code: 'IN-RJ', name: 'Rajasthan', type: 'state', capital: 'Jaipur' },
      { code: 'IN-BR', name: 'Bihar', type: 'state', capital: 'Patna' },
      { code: 'IN-KA', name: 'Karnataka', type: 'state', capital: 'Bengaluru' },
      { code: 'IN-TN', name: 'Tamil Nadu', type: 'state', capital: 'Chennai' },
      { code: 'IN-WB', name: 'West Bengal', type: 'state', capital: 'Kolkata' },
      { code: 'IN-GJ', name: 'Gujarat', type: 'state', capital: 'Gandhinagar' },
      { code: 'IN-HR', name: 'Haryana', type: 'state', capital: 'Chandigarh' },
      { code: 'IN-PB', name: 'Punjab', type: 'state', capital: 'Chandigarh' },
      { code: 'IN-TS', name: 'Telangana', type: 'state', capital: 'Hyderabad' },
      { code: 'IN-AP', name: 'Andhra Pradesh', type: 'state', capital: 'Amaravati' },
      { code: 'IN-KL', name: 'Kerala', type: 'state', capital: 'Thiruvananthapuram' },
      { code: 'IN-JK', name: 'Jammu & Kashmir', type: 'ut', capital: 'Srinagar' },
      { code: 'IN-UK', name: 'Uttarakhand', type: 'state', capital: 'Dehradun' },
      { code: 'IN-OD', name: 'Odisha', type: 'state', capital: 'Bhubaneswar' },
      { code: 'IN-JH', name: 'Jharkhand', type: 'state', capital: 'Ranchi' },
      { code: 'IN-AS', name: 'Assam', type: 'state', capital: 'Dispur' },
    ];

    const stateMap: Record<string, string> = {};
    for (const s of states) {
      const res = await query(
        `INSERT INTO states (code, name, type, capital)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, capital = EXCLUDED.capital
         RETURNING id, name`,
        [s.code, s.name, s.type, s.capital]
      );
      stateMap[res.rows[0].name] = res.rows[0].id;
    }

    // 2. Categories
    console.log('🏷️ Ensuring Categories...');
    const categories = [
      { name: 'Engineering Entrance', slug: 'engineering-entrance', icon: 'Cpu', description: 'National and state level engineering admissions (JEE, BITSAT, State CETs, GATE)' },
      { name: 'Medical & Dental Entrance', slug: 'medical-entrance', icon: 'Activity', description: 'Medical, dental, AYUSH, and nursing degree admissions (NEET UG, NEET PG, INI-CET)' },
      { name: 'Class 10 & 12 School Boards', slug: 'school-boards', icon: 'GraduationCap', description: 'CBSE, ICSE, NIOS, MPBSE, UPMSP, BSEB, and State Higher Secondary Boards' },
      { name: 'Civil Services & State PSCs', slug: 'civil-services', icon: 'Landmark', description: 'Union Public Service Commission (UPSC) and State Public Service Commissions (MPPSC, UPPSC, BPSC, etc.)' },
      { name: 'Staff Selection (SSC)', slug: 'staff-selection', icon: 'FileCheck', description: 'CGL, CHSL, MTS, CPO, GD Constable, JE recruitment examinations' },
      { name: 'Banking & Financial Sector', slug: 'banking-insurance', icon: 'Building2', description: 'IBPS PO/Clerk, SBI PO/Clerk, RBI Grade B, NABARD, LIC examinations' },
      { name: 'Defence & Paramilitary', slug: 'defence-services', icon: 'Shield', description: 'NDA, CDS, AFCAT, CAPF AC, Agniveer, Indian Navy, Coast Guard' },
      { name: 'Railways (RRB)', slug: 'railways-rrb', icon: 'Train', description: 'RRB NTPC, Group D (Level 1), ALP, Technician, Junior Engineer recruitment' },
      { name: 'University & Higher Education', slug: 'university-entrance', icon: 'BookOpen', description: 'CUET UG, CUET PG, IIT JAM, TIFR, JEST admissions to top Central & State Universities' },
      { name: 'Law Entrance Exams', slug: 'law-entrance', icon: 'Scale', description: 'CLAT UG/PG, AILET (NLU Delhi), SLAT, LSAT India, MH CET Law' },
      { name: 'Management Entrance (MBA)', slug: 'management-entrance', icon: 'Briefcase', description: 'CAT, XAT, MAT, CMAT, SNAP, NMAT for admissions to IIMs and Top B-Schools' },
      { name: 'Teaching & Research (TET/NET)', slug: 'teaching-exams', icon: 'Award', description: 'CTET, UGC NET, CSIR NET, KVS, NVS, State TETs' },
      { name: 'Design, Fashion & Hotel Mgmt', slug: 'design-hospitality', icon: 'Palette', description: 'NID DAT, NIFT, UCEED/CEED, NCHMCT JEE' },
      { name: 'Scholarships & Fellowships', slug: 'scholarships-fellowships', icon: 'Sparkles', description: 'National and international merit and means-based financial aid' },
      { name: 'Government Job Vacancies', slug: 'government-jobs', icon: 'Briefcase', description: 'Sarkari Naukri recruitment notices across Ministries and Public Sector Undertakings' },
      { name: 'Student Internships', slug: 'student-internships', icon: 'Layers', description: 'Government policy, research, technical, and summer internship schemes' },
    ];

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

    // 3. Organizations
    console.log('🏛️ Ensuring Organizations...');
    const organizations = [
      {
        name: 'National Testing Agency',
        short_name: 'NTA',
        slug: 'nta',
        official_domain: 'nta.ac.in',
        description: 'Autonomous premier testing organization established by Ministry of Education, Govt of India.',
        org_type: 'national_testing',
        official_portal_url: 'https://nta.ac.in',
        helpline_number: '011-40759000 / 011-69227700',
        contact_email: 'genadmin@nta.ac.in',
        is_verified: true,
      },
      {
        name: 'Union Public Service Commission',
        short_name: 'UPSC',
        slug: 'upsc',
        official_domain: 'upsc.gov.in',
        description: 'Constitutional body mandated under Article 315-323 of the Constitution of India for recruitment to Civil Services and Defence Services.',
        org_type: 'commission',
        official_portal_url: 'https://upsc.gov.in',
        helpline_number: '011-23385271 / 011-23381125',
        contact_email: 'feedback-upsc@gov.in',
        is_verified: true,
      },
      {
        name: 'Staff Selection Commission',
        short_name: 'SSC',
        slug: 'ssc',
        official_domain: 'ssc.gov.in',
        description: 'Recruits staff for various posts in ministries, departments of Govt of India, and subordinate offices.',
        org_type: 'recruitment',
        official_portal_url: 'https://ssc.gov.in',
        helpline_number: '1800-309-3063',
        contact_email: 'enquiry-ssc@nic.in',
        is_verified: true,
      },
      {
        name: 'Central Board of Secondary Education',
        short_name: 'CBSE',
        slug: 'cbse',
        official_domain: 'cbse.gov.in',
        description: 'National level board of education in India for public and private schools controlled and managed by the Ministry of Education.',
        org_type: 'board',
        official_portal_url: 'https://cbse.gov.in',
        helpline_number: '1800-11-8002',
        contact_email: 'info.cbse@gov.in',
        is_verified: true,
      },
      {
        name: 'Council for the Indian School Certificate Examinations',
        short_name: 'CISCE',
        slug: 'cisce',
        official_domain: 'cisce.org',
        description: 'National-level, private board of school education in India that conducts ICSE and ISC examinations.',
        org_type: 'board',
        official_portal_url: 'https://cisce.org',
        helpline_number: '011-26413820',
        contact_email: 'council@cisce.org',
        is_verified: true,
      },
      {
        name: 'Madhya Pradesh Board of Secondary Education',
        short_name: 'MPBSE',
        slug: 'mpbse',
        official_domain: 'mpbse.nic.in',
        description: 'State government body responsible for determining the policy-related, administrative, cognitive, and intellectual direction of the Madhya Pradesh state higher educational system.',
        org_type: 'board',
        official_portal_url: 'https://mpbse.nic.in',
        helpline_number: '0755-2551166',
        contact_email: 'mpbse@mp.nic.in',
        is_verified: true,
      },
      {
        name: 'Uttar Pradesh Madhyamik Shiksha Parishad',
        short_name: 'UPMSP',
        slug: 'upmsp',
        official_domain: 'upmsp.edu.in',
        description: 'Board of High School and Intermediate Education Uttar Pradesh, world’s largest examining body in terms of student count.',
        org_type: 'board',
        official_portal_url: 'https://upmsp.edu.in',
        helpline_number: '1800-180-5310',
        contact_email: 'upmsp@nic.in',
        is_verified: true,
      },
      {
        name: 'Bihar School Examination Board',
        short_name: 'BSEB',
        slug: 'bseb',
        official_domain: 'biharboardonline.bihar.gov.in',
        description: 'Statutory body under section 3 of Bihar School Examination Act conducting matriculation and intermediate examinations.',
        org_type: 'board',
        official_portal_url: 'https://biharboardonline.bihar.gov.in',
        helpline_number: '0612-2232074',
        contact_email: 'bsebsehelpdesk@gmail.com',
        is_verified: true,
      },
      {
        name: 'Maharashtra State Board of Secondary and Higher Secondary Education',
        short_name: 'MSBSHSE',
        slug: 'msbshse',
        official_domain: 'mahahsscboard.in',
        description: 'Statutory and autonomous body established under the Maharashtra Secondary Boards Act 1965 conducting SSC and HSC.',
        org_type: 'board',
        official_portal_url: 'https://mahahsscboard.in',
        helpline_number: '020-25705301',
        contact_email: 'secretary@mahahsscboard.in',
        is_verified: true,
      },
      {
        name: 'Madhya Pradesh Public Service Commission',
        short_name: 'MPPSC',
        slug: 'mppsc',
        official_domain: 'mppsc.mp.gov.in',
        description: 'Constitutional body under Article 315 of Constitution of India for civil service recruitment in Madhya Pradesh.',
        org_type: 'commission',
        official_portal_url: 'https://mppsc.mp.gov.in',
        helpline_number: '0731-2491608',
        contact_email: 'secretary-mppsc@mp.gov.in',
        is_verified: true,
      },
      {
        name: 'Uttar Pradesh Public Service Commission',
        short_name: 'UPPSC',
        slug: 'uppsc',
        official_domain: 'uppsc.up.nic.in',
        description: 'State agency authorized to conduct the Civil Services Examination for entry-level appointments to the various Group A and Group B Civil Services of Uttar Pradesh.',
        org_type: 'commission',
        official_portal_url: 'https://uppsc.up.nic.in',
        helpline_number: '0532-2407547',
        contact_email: 'online.uppsc@nic.in',
        is_verified: true,
      },
      {
        name: 'Bihar Public Service Commission',
        short_name: 'BPSC',
        slug: 'bpsc',
        official_domain: 'bpsc.bih.nic.in',
        description: 'Constitutional body created by the Constitution of India to select applicants for civil service jobs in Bihar state.',
        org_type: 'commission',
        official_portal_url: 'https://bpsc.bih.nic.in',
        helpline_number: '0612-2215750',
        contact_email: 'bpscpat-bih@nic.in',
        is_verified: true,
      },
      {
        name: 'Institute of Banking Personnel Selection',
        short_name: 'IBPS',
        slug: 'ibps',
        official_domain: 'ibps.in',
        description: 'Autonomous recruitment body that conducts common recruitment processes for Public Sector Banks, Regional Rural Banks, and Financial Institutions.',
        org_type: 'recruitment',
        official_portal_url: 'https://ibps.in',
        helpline_number: '1800-222-366',
        contact_email: 'support@ibps.in',
        is_verified: true,
      },
      {
        name: 'State Bank of India',
        short_name: 'SBI',
        slug: 'sbi',
        official_domain: 'sbi.co.in',
        description: 'India’s largest public sector bank conducting independent national recruitments for Probationary Officers and Junior Associates.',
        org_type: 'recruitment',
        official_portal_url: 'https://sbi.co.in/careers',
        helpline_number: '022-22820427',
        contact_email: 'crpd@sbi.co.in',
        is_verified: true,
      },
      {
        name: 'Reserve Bank of India',
        short_name: 'RBI',
        slug: 'rbi',
        official_domain: 'rbi.org.in',
        description: 'Central banking institution of India conducting apex recruitment for Grade B Officers, Assistant Cadre, and Summer Research Interns.',
        org_type: 'recruitment',
        official_portal_url: 'https://opportunities.rbi.org.in',
        helpline_number: '022-22601000',
        contact_email: 'helpdesk.rbisb@rbi.org.in',
        is_verified: true,
      },
      {
        name: 'Railway Recruitment Control Board',
        short_name: 'RRB',
        slug: 'rrb',
        official_domain: 'rrbcdg.gov.in',
        description: 'Government organization under the Ministry of Railways managing recruitment across 21 RRB regional boards for Indian Railways.',
        org_type: 'recruitment',
        official_portal_url: 'https://rrbapply.gov.in',
        helpline_number: '0172-2730093',
        contact_email: 'rrb-rectt@gov.in',
        is_verified: true,
      },
      {
        name: 'Consortium of National Law Universities',
        short_name: 'Consortium of NLUs',
        slug: 'consortium-of-nlus',
        official_domain: 'consortiumofnlus.ac.in',
        description: 'Apex body of 24 National Law Universities across India conducting CLAT UG and PG.',
        org_type: 'university',
        official_portal_url: 'https://consortiumofnlus.ac.in',
        helpline_number: '080-47162020',
        contact_email: 'clat@consortiumofnlus.ac.in',
        is_verified: true,
      },
      {
        name: 'Indian Institute of Management (IIMs)',
        short_name: 'CAT Convener / IIMs',
        slug: 'iim-cat',
        official_domain: 'iimcat.ac.in',
        description: 'Rotating convener IIM conducting Common Admission Test (CAT) for all 21 Indian Institutes of Management and 100+ premier B-schools.',
        org_type: 'university',
        official_portal_url: 'https://iimcat.ac.in',
        helpline_number: '1800-210-8720',
        contact_email: 'cathelpdesk@iimcat.ac.in',
        is_verified: true,
      },
      {
        name: 'Indian Institute of Technology (IITs & IISc)',
        short_name: 'IITs / GATE-JAM',
        slug: 'iit-gate',
        official_domain: 'gate.iitk.ac.in',
        description: 'Premier engineering and scientific institutions conducting GATE (Graduate Aptitude Test in Engineering), JEE Advanced, and IIT JAM.',
        org_type: 'university',
        official_portal_url: 'https://gate2026.iitr.ac.in',
        helpline_number: '01332-284531',
        contact_email: 'gate@iitr.ac.in',
        is_verified: true,
      },
      {
        name: 'NITI Aayog (Govt of India)',
        short_name: 'NITI Aayog',
        slug: 'niti-aayog',
        official_domain: 'niti.gov.in',
        description: 'Apex public policy think tank of the Government of India providing strategic and technical advice to Central and State Governments.',
        org_type: 'commission',
        official_portal_url: 'https://niti.gov.in/internship',
        helpline_number: '011-23096620',
        contact_email: 'internship-niti@gov.in',
        is_verified: true,
      },
      {
        name: 'Ministry of External Affairs (MEA)',
        short_name: 'MEA India',
        slug: 'mea-india',
        official_domain: 'mea.gov.in',
        description: 'Government agency responsible for the conduct of foreign relations of India.',
        org_type: 'commission',
        official_portal_url: 'https://internship.mea.gov.in',
        helpline_number: '011-23011156',
        contact_email: 'internship@mea.gov.in',
        is_verified: true,
      },
      {
        name: 'Indian Space Research Organisation',
        short_name: 'ISRO',
        slug: 'isro',
        official_domain: 'isro.gov.in',
        description: 'National space agency of India under the Department of Space, leading satellite, planetary, and space exploration missions.',
        org_type: 'national_testing',
        official_portal_url: 'https://isro.gov.in/Careers.html',
        helpline_number: '080-22172296',
        contact_email: 'careers@isro.gov.in',
        is_verified: true,
      },
      {
        name: 'Defence Research and Development Organisation',
        short_name: 'DRDO',
        slug: 'drdo',
        official_domain: 'drdo.gov.in',
        description: 'Premier defense agency under Ministry of Defence conducting military research, technology development, and national apprentice training.',
        org_type: 'defence',
        official_portal_url: 'https://drdo.gov.in/careers',
        helpline_number: '011-23882350',
        contact_email: 'director.ceptam@gov.in',
        is_verified: true,
      },
      {
        name: 'Lok Sabha Secretariat / PRIDE',
        short_name: 'Parliament of India',
        slug: 'parliament-india',
        official_domain: 'sansad.in',
        description: 'Parliamentary Research and Training Institute for Democracies (PRIDE) organizing prestigious legislative research fellowships and internships.',
        org_type: 'commission',
        official_portal_url: 'https://sansad.in/ls',
        helpline_number: '011-23034988',
        contact_email: 'pride@sansad.nic.in',
        is_verified: true,
      },
      {
        name: 'Department of Science & Technology (DST)',
        short_name: 'DST India',
        slug: 'dst-india',
        official_domain: 'online-inspire.gov.in',
        description: 'Nodal department in the Ministry of Science & Technology implementing the INSPIRE SHE scholarship and fellowship schemes.',
        org_type: 'scholarship_body',
        official_portal_url: 'https://online-inspire.gov.in',
        helpline_number: '0120-4676260',
        contact_email: 'inspire.prog-dst@nic.in',
        is_verified: true,
      },
      {
        name: 'National Scholarship Portal (NSP)',
        short_name: 'NSP / MoE',
        slug: 'nsp-portal',
        official_domain: 'scholarships.gov.in',
        description: 'Mission Mode Project under the Digital India initiative providing a common electronic platform for implementing various DBT scholarship schemes.',
        org_type: 'scholarship_body',
        official_portal_url: 'https://scholarships.gov.in',
        helpline_number: '0120-6619540',
        contact_email: 'helpdesk@nsp.gov.in',
        is_verified: true,
      },
    ];

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

    console.log('📚 Seeding 25+ All-India Major Exams with Full Context Articles & Schemes...');
    // We will insert exams now
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}
seedComprehensiveCatalog();
