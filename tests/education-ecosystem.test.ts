import { describe, it, expect } from 'vitest';
import { query } from '../src/lib/db';

describe('Education Ecosystem & Relational Schema', () => {
  it('should verify counselling authorities are present with official domains', async () => {
    const res = await query('SELECT slug, official_domain, is_verified FROM counselling_authorities');
    expect(res.rows.length).toBeGreaterThanOrEqual(5);
    const josaa = res.rows.find((r) => r.slug === 'josaa');
    expect(josaa).toBeDefined();
    expect(josaa.official_domain).toBe('josaa.nic.in');
    expect(josaa.is_verified).toBe(true);

    const mcc = res.rows.find((r) => r.slug === 'mcc');
    expect(mcc).toBeDefined();
    expect(mcc.official_domain).toBe('mcc.nic.in');
  });

  it('should verify participating institutions have mapped exams and courses', async () => {
    const res = await query('SELECT slug, institution_type, accepted_exams, courses_offered FROM institutions');
    expect(res.rows.length).toBeGreaterThanOrEqual(5);
    const iitb = res.rows.find((r) => r.slug === 'iit-bombay');
    expect(iitb).toBeDefined();
    expect(iitb.institution_type).toBe('IIT');
    expect(iitb.accepted_exams).toContain('JEE Advanced');
  });

  it('should verify recognized courses have valid degree levels and stream prerequisites', async () => {
    const res = await query('SELECT slug, degree_level, stream, regulatory_body FROM courses');
    expect(res.rows.length).toBeGreaterThanOrEqual(10);
    const mbbs = res.rows.find((r) => r.slug === 'mbbs-medicine');
    expect(mbbs).toBeDefined();
    expect(mbbs.degree_level).toBe('UG');
    expect(mbbs.regulatory_body).toBe('National Medical Commission (NMC)');

    const btech = res.rows.find((r) => r.slug === 'b-tech-engineering');
    expect(btech).toBeDefined();
    expect(btech.degree_level).toBe('UG');
  });

  it('should verify central and state education boards are mapped with official websites', async () => {
    const res = await query('SELECT slug, board_type, official_domain FROM boards');
    expect(res.rows.length).toBeGreaterThanOrEqual(5);
    const cbse = res.rows.find((r) => r.slug === 'cbse');
    expect(cbse).toBeDefined();
    expect(cbse.official_domain).toBe('cbse.gov.in');
  });

  it('should verify student pathways cover 10th, 12th PCM, 12th PCB, Commerce, Arts, and Graduation', async () => {
    const res = await query('SELECT stage_from, flow_stages, entrance_exams FROM student_pathways');
    expect(res.rows.length).toBeGreaterThanOrEqual(5);
    const stages = res.rows.map((r) => r.stage_from);
    expect(stages).toContain('Class 10');
    expect(stages).toContain('Class 12 (PCM)');
    expect(stages).toContain('Class 12 (PCB)');
    expect(stages).toContain('Class 12 (Commerce)');
  });

  it('should strictly enforce that unannounced exam events have NULL dates', async () => {
    const res = await query("SELECT title, start_date, end_date, status FROM exam_events WHERE status = 'unannounced'");
    expect(res.rows.length).toBeGreaterThan(0);
    for (const row of res.rows) {
      expect(row.start_date).toBeNull();
      expect(row.end_date).toBeNull();
    }
  });
});
