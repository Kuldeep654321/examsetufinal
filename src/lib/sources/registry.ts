import { BaseSourceAdapter } from './types';
import { NTAAdapter } from './adapters/nta.adapter';
import {
  UPSCAdapter,
  SSCAdapter,
  CBSEAdapter,
  MPBSEAdapter,
  MPPSCAdapter,
  IBPSAdapter,
  CLATAdapter,
  CATAdapter,
  GATEAdapter,
  RRBAdapter,
  UPPSCAdapter,
  BPSCAdapter,
  RBIAdapter,
  SBIAdapter,
  NITIAayogAdapter,
  MEAAdapter,
  ISROAdapter,
  DRDOAdapter,
  ParliamentAdapter,
  ScholarshipsAdapter,
} from './adapters/all-adapters';

class SourceRegistry {
  private adapters: Map<string, BaseSourceAdapter> = new Map();

  constructor() {
    this.register(new NTAAdapter());
    this.register(new UPSCAdapter());
    this.register(new SSCAdapter());
    this.register(new CBSEAdapter());
    this.register(new MPBSEAdapter());
    this.register(new MPPSCAdapter());
    this.register(new IBPSAdapter());
    this.register(new CLATAdapter());
    this.register(new CATAdapter());
    this.register(new GATEAdapter());
    this.register(new RRBAdapter());
    this.register(new UPPSCAdapter());
    this.register(new BPSCAdapter());
    this.register(new RBIAdapter());
    this.register(new SBIAdapter());
    this.register(new NITIAayogAdapter());
    this.register(new MEAAdapter());
    this.register(new ISROAdapter());
    this.register(new DRDOAdapter());
    this.register(new ParliamentAdapter());
    this.register(new ScholarshipsAdapter());
  }

  public register(adapter: BaseSourceAdapter) {
    this.adapters.set(adapter.adapterName, adapter);
  }

  public get(adapterName: string): BaseSourceAdapter | undefined {
    return this.adapters.get(adapterName);
  }

  public getAll(): BaseSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  public getForOrganization(orgSlug: string): BaseSourceAdapter[] {
    return this.getAll().filter((a) => a.organizationSlug === orgSlug);
  }
}

export const sourceRegistry = new SourceRegistry();
