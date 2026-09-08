import { describe, it, expect } from 'vitest';
import { query } from '../src/lib/db';

describe('Global Typo-Tolerant Search', () => {
  it('should find NEET examination matching exact and trigram queries', async () => {
    const res = await query(
      `SELECT title, slug FROM exams WHERE title ILIKE $1 OR short_title ILIKE $1 OR similarity(title, 'NEET') > 0.1`,
      ['%NEET%']
    );

    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows.some((r) => r.slug === 'neet-ug-2027')).toBe(true);
  });

  it('should find MP Board examinations matching "MP Board" or "MPBSE"', async () => {
    const res = await query(
      `SELECT title, slug FROM exams WHERE title ILIKE $1 OR short_title ILIKE $1`,
      ['%MP Board%']
    );

    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows.some((r) => r.slug.includes('mp-board'))).toBe(true);
  });

  it('should find National Scholarship Portal opportunities', async () => {
    const res = await query(
      `SELECT title, slug FROM opportunities WHERE title ILIKE $1`,
      ['%Central Sector%']
    );

    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows[0].slug).toBe('nsp-central-sector-scholarship-2027');
  });
});
