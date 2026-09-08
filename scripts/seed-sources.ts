import { query } from '../src/lib/db';

async function seedSources() {
  console.log('Seeding official sources for all organizations...');

  const orgsRes = await query('SELECT id, short_name, official_domain, official_portal_url FROM organizations');
  const orgMap = new Map<string, { id: string; domain: string; portal: string }>();
  for (const row of orgsRes.rows) {
    orgMap.set(row.short_name, { id: row.id, domain: row.official_domain, portal: row.official_portal_url });
  }

  const sourcesData = [
    {
      orgShort: 'NTA',
      name: 'NTA Active Examination Notifications',
      domain: 'nta.ac.in',
      url: 'https://nta.ac.in/Notice',
      type: 'official_html',
    },
    {
      orgShort: 'UPSC',
      name: 'UPSC Official Examination Notice Board',
      domain: 'upsc.gov.in',
      url: 'https://upsc.gov.in/examinations/active-examinations',
      type: 'official_html',
    },
    {
      orgShort: 'SSC',
      name: 'SSC Official Recruitment Notices & Calendar',
      domain: 'ssc.gov.in',
      url: 'https://ssc.gov.in/notices',
      type: 'official_html',
    },
    {
      orgShort: 'CBSE',
      name: 'CBSE Official Academic & Exam Board Circulars',
      domain: 'cbse.gov.in',
      url: 'https://www.cbse.gov.in/cbsenew/cbse.html',
      type: 'official_html',
    },
    {
      orgShort: 'MPBSE',
      name: 'MPBSE Board Announcements & Timetables',
      domain: 'mpbse.nic.in',
      url: 'https://mpbse.nic.in/announcements.htm',
      type: 'official_html',
    },
    {
      orgShort: 'MPPSC',
      name: 'MPPSC Official Recruitment & Calendar Feed',
      domain: 'mppsc.mp.gov.in',
      url: 'https://mppsc.mp.gov.in/whats_new',
      type: 'official_html',
    },
    {
      orgShort: 'IBPS',
      name: 'IBPS Official Examination Notifications',
      domain: 'ibps.in',
      url: 'https://www.ibps.in/notifications',
      type: 'official_html',
    },
    {
      orgShort: 'Consortium of NLUs',
      name: 'CLAT Official Portal & Notifications',
      domain: 'consortiumofnlus.ac.in',
      url: 'https://consortiumofnlus.ac.in/clat-2027',
      type: 'official_html',
    },
    {
      orgShort: 'IIMs / CAT',
      name: 'CAT Official Information & Registration Portal',
      domain: 'iimcat.ac.in',
      url: 'https://iimcat.ac.in',
      type: 'official_html',
    },
    {
      orgShort: 'IITs / GATE-JAM',
      name: 'GATE 2027 Official IIT Kanpur Portal',
      domain: 'gate.iitk.ac.in',
      url: 'https://gate.iitk.ac.in',
      type: 'official_html',
    },
    {
      orgShort: 'RRB',
      name: 'Railway Recruitment Control Board Portal',
      domain: 'rrbapply.gov.in',
      url: 'https://rrbapply.gov.in',
      type: 'official_html',
    },
    {
      orgShort: 'RBI',
      name: 'RBI Opportunities & Recruitment Portal',
      domain: 'rbi.org.in',
      url: 'https://opportunities.rbi.org.in',
      type: 'official_html',
    },
    {
      orgShort: 'SBI',
      name: 'SBI Careers & Recruitment Board',
      domain: 'sbi.co.in',
      url: 'https://sbi.co.in/careers',
      type: 'official_html',
    },
    {
      orgShort: 'NITI Aayog',
      name: 'NITI Aayog Official Internship Scheme Portal',
      domain: 'niti.gov.in',
      url: 'https://niti.gov.in/internship',
      type: 'official_html',
    },
    {
      orgShort: 'MEA India',
      name: 'Ministry of External Affairs Internship Portal',
      domain: 'mea.gov.in',
      url: 'https://internship.mea.gov.in',
      type: 'official_html',
    },
    {
      orgShort: 'ISRO',
      name: 'ISRO Official Careers & YUVIKA Portal',
      domain: 'isro.gov.in',
      url: 'https://www.isro.gov.in/Careers.html',
      type: 'official_html',
    },
    {
      orgShort: 'DRDO',
      name: 'DRDO RAC Recruitment & Apprentice Portal',
      domain: 'drdo.gov.in',
      url: 'https://drdo.gov.in/careers',
      type: 'official_html',
    },
    {
      orgShort: 'UPPSC',
      name: 'UPPSC Official Notice Board & Calendar',
      domain: 'uppsc.up.nic.in',
      url: 'https://uppsc.up.nic.in',
      type: 'official_html',
    },
    {
      orgShort: 'BPSC',
      name: 'BPSC Notice Board & Exam Schedules',
      domain: 'bpsc.bih.nic.in',
      url: 'https://bpsc.bih.nic.in',
      type: 'official_html',
    },
    {
      orgShort: 'Parliament of India',
      name: 'Lok Sabha Secretariat / PRIDE Fellowship Portal',
      domain: 'sansad.in',
      url: 'https://sansad.in/ls',
      type: 'official_html',
    },
  ];

  for (const src of sourcesData) {
    const org = orgMap.get(src.orgShort);
    if (!org) continue;

    await query(
      `INSERT INTO sources (
        name, org_id, official_domain, base_url, source_type, adapter_name,
        check_interval_minutes, is_enabled, health_status, last_successful_fetch
      ) VALUES ($1, $2, $3, $4, $5, $6, 30, true, 'healthy', NOW())
      ON CONFLICT DO NOTHING`,
      [src.name, org.id, src.domain, src.url, src.type, `${src.orgShort.toLowerCase().replace(/[^a-z0-9]/g, '_')}_adapter`]
    );
  }

  console.log('Official sources seeded successfully.');
}

seedSources().catch(console.error).finally(() => process.exit(0));
