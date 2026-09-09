import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  Layers,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Building2,
  FileCheck2,
  HelpCircle,
  Phone
} from 'lucide-react';
import { CounsellingAuthority } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'India Counselling Systems & Seat Allocation Directory - ExamSetu',
  description: 'Official centralized counselling authorities across India: JoSAA, CSAB, MCC Medical, AACCC AYUSH, VCI Veterinary, Consortium of NLUs, CCMT M.Tech, and State CETs with verified step-by-step admission rules.',
  alternates: {
    canonical: 'https://examsetu.in/counselling',
  },
};

async function getCounsellingAuthorities(stream?: string, q?: string): Promise<CounsellingAuthority[]> {
  let sql = `
    SELECT
      ca.id,
      ca.name,
      ca.short_name,
      ca.slug,
      ca.stream,
      ca.jurisdiction,
      ca.conducting_body,
      ca.official_website,
      ca.official_domain,
      ca.description,
      ca.helpline_number,
      ca.contact_email,
      ca.is_verified,
      ca.last_verified_at
    FROM counselling_authorities ca
    WHERE ca.is_verified = true
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (stream && stream !== 'all') {
    sql += ` AND ca.stream ILIKE $${paramIndex++}`;
    params.push(`%${stream}%`);
  }

  if (q) {
    sql += ` AND (ca.name ILIKE $${paramIndex} OR ca.short_name ILIKE $${paramIndex} OR ca.description ILIKE $${paramIndex})`;
    params.push(`%${q}%`);
    paramIndex++;
  }

  sql += ` ORDER BY ca.short_name ASC`;

  const authRes = await query(sql, params);
  const procRes = await query(`
    SELECT id, authority_id, title, slug, cycle_year, status, official_portal_url
    FROM counselling_processes
  `);

  const authorities = authRes.rows.map((auth: any) => {
    const processes = procRes.rows.filter((p: any) => p.authority_id === auth.id || p.authority_id === auth.slug);
    return {
      ...auth,
      processes,
    };
  });

  return authorities;
}

export default async function CounsellingDirectoryPage({
  searchParams,
}: {
  searchParams?: { stream?: string; q?: string };
}) {
  const streamFilter = searchParams?.stream || 'all';
  const queryFilter = searchParams?.q || '';

  const authorities = await getCounsellingAuthorities(
    streamFilter === 'all' ? undefined : streamFilter,
    queryFilter || undefined
  );

  const streams = [
    { label: 'All Streams', value: 'all' },
    { label: 'Engineering (JoSAA/CSAB)', value: 'Engineering' },
    { label: 'Medical & Dental (MCC)', value: 'Medical' },
    { label: 'AYUSH (AACCC)', value: 'AYUSH' },
    { label: 'Law (NLUs)', value: 'Law' },
    { label: 'Management (IIM CAP)', value: 'Management' },
    { label: 'Veterinary (VCI)', value: 'Veterinary' },
    { label: 'State Combined CETs', value: 'State' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Counselling Systems</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-indigo-900/50">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>National & State Seat Allocation Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Official Counselling Authorities & Admission Portals
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          From entrance exam results to college reporting — explore verified central and state counselling authorities (JoSAA, CSAB, MCC, AACCC, VCI, CLAT Consortium, IIM CAP), multi-round seat allotment rules, freeze/float/slide mechanics, and document checklists.
        </p>

        {/* Filter Badges */}
        <div className="pt-2 flex flex-wrap gap-2">
          {streams.map((st) => {
            const isActive = streamFilter === st.value;
            return (
              <Link
                key={st.value}
                href={`/counselling?stream=${encodeURIComponent(st.value)}${queryFilter ? `&q=${encodeURIComponent(queryFilter)}` : ''}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                {st.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Authorities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authorities.map((auth) => (
          <div
            key={auth.id}
            className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Stream & Verified Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {auth.stream}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Authority
                </span>
              </div>

              {/* Authority Title */}
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition">
                  {auth.name} ({auth.short_name})
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  <strong>Jurisdiction:</strong> {auth.jurisdiction}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {auth.description}
              </p>

              {/* Conducting Body */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{auth.conducting_body}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Domain: {auth.official_domain}
                </div>
              </div>

              {/* Active / Mapped Processes */}
              {auth.processes && auth.processes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Counselling Cycles & Guides:
                  </span>
                  {auth.processes.map((proc: any) => {
                    const isConcluded = proc.status === 'concluded' || proc.status === 'completed';
                    const isOngoing = proc.status === 'ongoing' || proc.status === 'active' || proc.status === 'open';
                    return (
                      <Link
                        key={proc.id}
                        href={`/counselling/${proc.slug}`}
                        className="text-xs font-bold text-slate-800 hover:text-blue-700 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 transition"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isOngoing ? 'bg-emerald-500 animate-pulse' : isConcluded ? 'bg-slate-400' : 'bg-amber-400'
                            }`}
                          />
                          <span className="truncate">{proc.title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                            isOngoing
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isConcluded
                              ? 'bg-slate-200 text-slate-700 border border-slate-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isOngoing ? 'Active / In Progress' : isConcluded ? 'Concluded' : 'Upcoming'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={auth.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
              >
                Official Portal <ExternalLink className="w-3 h-3" />
              </a>

              <Link
                href={`/counselling/${auth.slug}`}
                className="font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Rules <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
