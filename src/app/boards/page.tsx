import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  BookOpen,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  FileCheck2,
  HelpCircle,
  Phone,
  Layers
} from 'lucide-react';
import { Board } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Central & State School Education Boards Directory - ExamSetu',
  description: 'Verified directory of Indian School Education Boards: CBSE, CISCE (ICSE/ISC), NIOS, UPMSP, MPBSE, BSEB, MSBSHSE, RBSE, GSEB with Class 10 & 12 exam rules, practicals, grading, and re-evaluation.',
  alternates: {
    canonical: 'https://examsetu.in/boards',
  },
};

async function getBoards(type?: string, q?: string): Promise<Board[]> {
  let sql = `
    SELECT
      b.id,
      b.name,
      b.short_name,
      b.slug,
      b.board_type,
      b.state_name,
      b.official_website,
      b.official_domain,
      b.classes_covered,
      b.grading_system,
      b.supplementary_exam_name,
      b.revaluation_process_info,
      b.pattern_summary,
      b.practical_exam_info,
      b.helpline_number,
      b.is_verified,
      b.last_verified_at
    FROM boards b
    WHERE b.is_verified = true
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (type && type !== 'all') {
    sql += ` AND b.board_type = $${paramIndex++}`;
    params.push(type);
  }

  if (q) {
    sql += ` AND (b.name ILIKE $${paramIndex} OR b.short_name ILIKE $${paramIndex} OR b.state_name ILIKE $${paramIndex})`;
    params.push(`%${q}%`);
    paramIndex++;
  }

  sql += ` ORDER BY b.board_type ASC, b.short_name ASC`;

  const res = await query(sql, params);
  return res.rows;
}

export default async function BoardsDirectoryPage({
  searchParams,
}: {
  searchParams?: { type?: string; q?: string };
}) {
  const typeFilter = searchParams?.type || 'all';
  const queryFilter = searchParams?.q || '';

  const boards = await getBoards(
    typeFilter === 'all' ? undefined : typeFilter,
    queryFilter || undefined
  );

  const typesList = [
    { label: 'All Boards', value: 'all' },
    { label: 'Central Boards (CBSE / CISCE)', value: 'central' },
    { label: 'State Boards', value: 'state' },
    { label: 'Open Schooling (NIOS)', value: 'open' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Education Boards</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-blue-900/50">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>India Central & State Education Boards Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Class 10 & 12 School Boards
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive directory of recognized central and state school education boards across India. Access official domains, examination patterns, practical assessment guidelines, grading systems, and supplementary/re-evaluation procedures.
        </p>

        {/* Filter Badges */}
        <div className="pt-2 flex flex-wrap gap-2">
          {typesList.map((t) => {
            const isActive = typeFilter === t.value;
            return (
              <Link
                key={t.value}
                href={`/boards?type=${encodeURIComponent(t.value)}${queryFilter ? `&q=${encodeURIComponent(queryFilter)}` : ''}`}
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

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((b) => (
          <div
            key={b.id}
            className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                  {b.board_type === 'central' ? 'Central Board' : b.board_type === 'open' ? 'National Open School' : `State: ${b.state_name}`}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Recognized
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition">
                  {b.name} ({b.short_name})
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Verified Domain: {b.official_domain}
                </p>
              </div>

              {/* Pattern Summary */}
              {b.pattern_summary && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>Exam Pattern:</strong> {b.pattern_summary}
                </p>
              )}

              {/* Grading & Supplementary Details */}
              <div className="space-y-1.5 text-xs text-slate-600">
                {b.grading_system && (
                  <p>
                    <strong className="text-slate-800">Grading:</strong> {b.grading_system}
                  </p>
                )}
                {b.supplementary_exam_name && (
                  <p>
                    <strong className="text-slate-800">Supplementary:</strong> {b.supplementary_exam_name}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
              {b.helpline_number ? (
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> {b.helpline_number}
                </span>
              ) : (
                <span className="text-slate-400">Official Portal</span>
              )}

              <a
                href={b.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Board Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
