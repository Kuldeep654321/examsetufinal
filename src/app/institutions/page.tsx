import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  Building2,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  MapPin,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';
import { Institution } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Top Participating Colleges & Universities in India - ExamSetu',
  description: 'Verified directory of premier Indian institutions: IITs, NITs, AIIMS, NLUs, IIMs, Central & State Universities with accepted entrance exams, counselling authorities, and recognized degree courses.',
  alternates: {
    canonical: 'https://examsetu.in/institutions',
  },
};

async function getInstitutions(type?: string, q?: string): Promise<Institution[]> {
  let sql = `
    SELECT
      i.id,
      i.name,
      i.short_name,
      i.slug,
      i.institution_type,
      i.state_name,
      i.city,
      i.official_website,
      i.affiliation,
      i.recognized_by,
      i.accepted_exams,
      i.counselling_authorities,
      i.courses_offered,
      i.campus_overview,
      i.is_verified,
      i.last_verified_at
    FROM institutions i
    WHERE i.is_verified = true
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (type && type !== 'all') {
    sql += ` AND i.institution_type = $${paramIndex++}`;
    params.push(type);
  }

  if (q) {
    sql += ` AND (i.name ILIKE $${paramIndex} OR i.short_name ILIKE $${paramIndex} OR i.city ILIKE $${paramIndex} OR i.state_name ILIKE $${paramIndex})`;
    params.push(`%${q}%`);
    paramIndex++;
  }

  sql += ` ORDER BY i.name ASC`;

  const res = await query(sql, params);
  return res.rows;
}

export default async function InstitutionsDirectoryPage({
  searchParams,
}: {
  searchParams?: { type?: string; q?: string };
}) {
  const typeFilter = searchParams?.type || 'all';
  const queryFilter = searchParams?.q || '';

  const institutions = await getInstitutions(
    typeFilter === 'all' ? undefined : typeFilter,
    queryFilter || undefined
  );

  const typesList = [
    { label: 'All Institutions', value: 'all' },
    { label: 'IITs (Engineering)', value: 'IIT' },
    { label: 'NITs (Engineering)', value: 'NIT' },
    { label: 'AIIMS (Medical)', value: 'AIIMS' },
    { label: 'NLUs (Law)', value: 'NLU' },
    { label: 'IIMs (Management)', value: 'IIM' },
    { label: 'Central Universities', value: 'Central_University' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Institutions & Colleges</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-blue-900/50">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>India Premier Higher Education Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Participating Institutes, Universities & Colleges
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Discover Institutes of National Importance across India. View official accepted entrance examinations (JEE, NEET, CLAT, CAT, GATE), mapped counselling systems (JoSAA, MCC, Consortium), recognized degree courses, and campus profiles.
        </p>

        {/* Filter Badges */}
        <div className="pt-2 flex flex-wrap gap-2">
          {typesList.map((t) => {
            const isActive = typeFilter === t.value;
            return (
              <Link
                key={t.value}
                href={`/institutions?type=${encodeURIComponent(t.value)}${queryFilter ? `&q=${encodeURIComponent(queryFilter)}` : ''}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map((inst) => (
          <div
            key={inst.id}
            className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Header: Type & Location */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                  {inst.institution_type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {inst.city}, {inst.state_name}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition leading-snug">
                  {inst.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {inst.short_name} • {inst.affiliation}
                </p>
              </div>

              {/* Campus Overview */}
              {inst.campus_overview && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {inst.campus_overview}
                </p>
              )}

              {/* Accepted Entrance Exams */}
              {inst.accepted_exams && inst.accepted_exams.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Accepted Entrance Exams:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {inst.accepted_exams.map((ex: string) => (
                      <span
                        key={ex}
                        className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded text-[11px]"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Counselling Authorities */}
              {inst.counselling_authorities && inst.counselling_authorities.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Counselling System:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {inst.counselling_authorities.map((cs: string) => (
                      <span
                        key={cs}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-800 font-bold border border-indigo-100 rounded text-[11px]"
                      >
                        {cs}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={inst.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
              >
                Official Site <ExternalLink className="w-3 h-3" />
              </a>

              <Link
                href={`/institutions/${inst.slug}`}
                className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                College Profile <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
