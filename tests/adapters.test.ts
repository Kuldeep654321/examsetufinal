import { describe, it, expect } from 'vitest';
import { sourceRegistry } from '../src/lib/sources/registry';

describe('Official Source Adapters & Registry', () => {
  it('should have all 21 official organization adapters registered', () => {
    const all = sourceRegistry.getAll();
    expect(all.length).toBe(21);

    const names = all.map((a) => a.adapterName);
    expect(names).toContain('nta_adapter');
    expect(names).toContain('upsc_adapter');
    expect(names).toContain('ssc_adapter');
    expect(names).toContain('cbse_adapter');
    expect(names).toContain('mpbse_adapter');
    expect(names).toContain('mppsc_adapter');
    expect(names).toContain('ibps_adapter');
    expect(names).toContain('clat_adapter');
    expect(names).toContain('cat_adapter');
    expect(names).toContain('gate_adapter');
    expect(names).toContain('rrb_adapter');
    expect(names).toContain('uppsc_adapter');
    expect(names).toContain('bpsc_adapter');
    expect(names).toContain('rbi_adapter');
    expect(names).toContain('sbi_adapter');
    expect(names).toContain('niti_aayog_adapter');
    expect(names).toContain('isro_adapter');
    expect(names).toContain('drdo_adapter');
    expect(names).toContain('parliament_of_india_adapter');
    expect(names).toContain('scholarships_adapter');
  });

  it('CLAT Adapter should return verified notice and parse into valid structured format', async () => {
    const adapter = sourceRegistry.get('clat_adapter');
    expect(adapter).toBeDefined();

    const fetchRes = await adapter!.fetchAnnouncements();
    expect(fetchRes.success).toBe(true);
    expect(fetchRes.statusCode).toBe(200);
    expect(fetchRes.items.length).toBeGreaterThan(0);

    const parsed = await adapter!.parseDocument(fetchRes.items[0]);
    expect(parsed).toBeDefined();
    expect(parsed!.targetExamSlug).toBe('clat-ug-2027');
    expect(parsed!.startDate).toBe('2026-08-03');
    expect(parsed!.endDate).toBe('2026-10-31');
  });

  it('GATE Adapter should fetch and parse IIT Kanpur GATE 2027 notice', async () => {
    const adapter = sourceRegistry.get('gate_adapter');
    expect(adapter).toBeDefined();

    const fetchRes = await adapter!.fetchAnnouncements();
    expect(fetchRes.success).toBe(true);
    expect(fetchRes.items.length).toBeGreaterThan(0);

    const parsed = await adapter!.parseDocument(fetchRes.items[0]);
    expect(parsed).toBeDefined();
    expect(parsed!.targetExamSlug).toBe('gate-2027');
    expect(parsed!.startDate).toBe('2026-08-28');
    expect(parsed!.endDate).toBe('2026-09-26');
  });

  it('NTA Adapter should return notices and parse them into valid structured format', async () => {
    const adapter = sourceRegistry.get('nta_adapter');
    expect(adapter).toBeDefined();

    const fetchRes = await adapter!.fetchAnnouncements();
    expect(fetchRes.success).toBe(true);
    expect(fetchRes.statusCode).toBe(200);
    expect(fetchRes.items.length).toBeGreaterThan(0);

    const firstItem = fetchRes.items[0];
    const parsed = await adapter!.parseDocument(firstItem);
    expect(parsed).toBeDefined();
    expect(parsed!.title).toContain('NEET (UG)');
    expect(parsed!.confidence).toBeGreaterThan(0.7);
  });

  it('UPSC Adapter should fetch and parse Civil Services Preliminary notice', async () => {
    const adapter = sourceRegistry.get('upsc_adapter');
    expect(adapter).toBeDefined();

    const fetchRes = await adapter!.fetchAnnouncements();
    expect(fetchRes.success).toBe(true);
    expect(fetchRes.items.length).toBeGreaterThan(0);

    const parsed = await adapter!.parseDocument(fetchRes.items[0]);
    expect(parsed).toBeDefined();
    expect(parsed!.targetExamSlug).toBe('upsc-cse-2027');
  });
});
