import { describe, it, expect } from 'vitest';
import { sourceRegistry } from '../src/lib/sources/registry';

describe('Official Source Adapters & Registry', () => {
  it('should have all 8 official organization adapters registered', () => {
    const all = sourceRegistry.getAll();
    expect(all.length).toBe(8);

    const names = all.map((a) => a.adapterName);
    expect(names).toContain('nta_adapter');
    expect(names).toContain('upsc_adapter');
    expect(names).toContain('ssc_adapter');
    expect(names).toContain('cbse_adapter');
    expect(names).toContain('mpbse_adapter');
    expect(names).toContain('mppsc_adapter');
    expect(names).toContain('ibps_adapter');
    expect(names).toContain('scholarships_adapter');
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
