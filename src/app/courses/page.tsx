import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  GraduationCap,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Clock,
  Layers,
  Award,
  Briefcase
} from 'lucide-react';
import { Course } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Undergraduate & Postgraduate Degree Courses in India - ExamSetu',
  description: 'Comprehensive directory of recognized degrees in India: B.Tech, MBBS, BDS, BAMS, B.Pharm, B.Sc Nursing, BA LLB, BBA, B.Arch, M.Tech, MD/MS, MBA, Polytechnic Diplomas with eligibility and entrance exams.',
  alternates: {
    canonical: 'https://examsetu.in/courses',
  },
};

async function getCourses(level?: string, stream?: string, q?: string): Promise<Course[]> {
  let sql = `
    SELECT
      c.id,
      c.name,
      c.short_name,
      c.slug,
      c.degree_level,
      c.stream,
      c.duration_years,
      c.eligibility_summary,
      c.stream_prerequisites,
      c.lateral_entry_available,
      c.regulatory_body,
      c.accepted_entrance_exams,
      c.counselling_routes,
      c.career_scope,
      c.top_specializations,
      c.is_verified,
      c.last_verified_at
    FROM courses c
    WHERE c.is_verified = true
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (level && level !== 'all') {
    sql += ` AND LOWER(c.degree_level) = LOWER($${paramIndex++})`;
    params.push(level);
  }

  if (stream && stream !== 'all') {
    sql += ` AND c.stream ILIKE $${paramIndex++}`;
    params.push(`%${stream}%`);
  }

  if (q) {
    sql += ` AND (c.name ILIKE $${paramIndex} OR c.short_name ILIKE $${paramIndex} OR c.career_scope ILIKE $${paramIndex})`;
    params.push(`%${q}%`);
    paramIndex++;
  }

  sql += ` ORDER BY c.degree_level ASC, c.name ASC`;

  const res = await query(sql, params);
  return res.rows;
}

export default async function CoursesDirectoryPage({
  searchParams,
}: {
  searchParams?: { level?: string; stream?: string; q?: string };
}) {
  const levelFilter = searchParams?.level || 'all';
  const streamFilter = searchParams?.stream || 'all';
  const queryFilter = searchParams?.q || '';

  const courses = await getCourses(
    levelFilter === 'all' ? undefined : levelFilter,
    streamFilter === 'all' ? undefined : streamFilter,
    queryFilter || undefined
  );

  const levelsList = [
    { label: 'All Levels', value: 'all' },
    { label: 'Undergraduate (UG)', value: 'UG' },
    { label: 'Postgraduate (PG)', value: 'PG' },
    { label: 'Integrated (5-Year)', value: 'Integrated' },
    { label: 'Diploma & Vocational', value: 'Diploma' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Courses Directory</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-emerald-900/50">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>India Recognized Degrees & Course Taxonomy</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Undergraduate, Postgraduate & Diploma Courses
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Explore officially recognized degrees governed by statutory apex bodies (NMC, AICTE, BCI, PCI, INC, COA). View official eligibility requirements, stream prerequisites, entrance exams, and professional career outcomes.
        </p>

        {/* Level Filters */}
        <div className="pt-2 flex flex-wrap gap-2">
          {levelsList.map((lvl) => {
            const isActive = levelFilter.toLowerCase() === lvl.value.toLowerCase();
            return (
              <Link
                key={lvl.value}
                href={`/courses?level=${encodeURIComponent(lvl.value)}${queryFilter ? `&q=${encodeURIComponent(queryFilter)}` : ''}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                {lvl.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((cr) => (
          <div
            key={cr.id}
            className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-3.5">
              {/* Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {cr.degree_level} • {cr.stream}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {cr.duration_years} Years
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition">
                  {cr.name} ({cr.short_name})
                </h3>
                {cr.regulatory_body && (
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Governed by: <strong>{cr.regulatory_body}</strong>
                  </p>
                )}
              </div>

              {/* Eligibility */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <strong>Eligibility:</strong> {cr.eligibility_summary}
              </p>

              {/* Accepted Entrance Exams */}
              {cr.accepted_entrance_exams && cr.accepted_entrance_exams.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Entrance Exams:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cr.accepted_entrance_exams.map((ex: string) => (
                      <span
                        key={ex}
                        className="px-2 py-0.5 bg-blue-50 text-blue-800 font-bold border border-blue-100 rounded text-[11px]"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specializations */}
              {cr.top_specializations && cr.top_specializations.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Top Specializations:
                  </span>
                  <p className="text-xs text-slate-700 font-semibold line-clamp-2">
                    {cr.top_specializations.slice(0, 4).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Statutory Degree
              </span>

              <Link
                href={`/career-pathways?q=${encodeURIComponent(cr.short_name)}`}
                className="font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                View Pathways <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
