import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import {
  BookOpen,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Phone,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PageProps {
  params: { slug: string };
}

async function getBoardData(slug: string) {
  const res = await query(
    `SELECT
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
    WHERE b.slug = $1`,
    [slug]
  );

  if (res.rows.length === 0) return null;
  const board = res.rows[0];

  // Also fetch related exams
  const examsRes = await query(
    `SELECT e.id, e.slug, e.title, e.short_title, e.level, e.exam_pattern
     FROM exams e
     WHERE e.conducting_org_id = $1 OR e.slug ILIKE $2`,
    [board.id, `%${board.slug}%`]
  );

  return { board, exams: examsRes.rows };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getBoardData(params.slug);
  if (!data) return { title: 'Board Not Found - ExamSetu' };

  return {
    title: `${data.board.name} (${data.board.short_name}) - Class 10 & 12 Official Portal & Guidelines | ExamSetu`,
    description: `Official Class 10 and 12 examination guidelines, grading system, practical evaluation, and supplementary rules for ${data.board.name}.`,
    alternates: {
      canonical: `https://examsetu.in/boards/${params.slug}`,
    },
  };
}

export default async function BoardDetailPage({ params }: PageProps) {
  const data = await getBoardData(params.slug);
  if (!data) notFound();

  const { board, exams } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/boards" className="hover:text-blue-600">Education Boards</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate max-w-xs">{board.short_name}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-blue-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {board.board_type === 'central' ? 'Central Education Board' : board.board_type === 'open' ? 'National Open School' : `State Board • ${board.state_name}`}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Official Recognized Board
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          {board.name} ({board.short_name})
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Official statutory examination authority conducting secondary (Class 10) and senior secondary (Class 12) board examinations.
        </p>

        {/* Action Link */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={board.official_website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            Visit Official Portal ({board.official_domain}) <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pattern Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Examination Pattern & Structure
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {board.pattern_summary || 'Annual descriptive examinations conducted across theory, practical, and internal continuous assessment components.'}
          </p>
        </div>

        {/* Practical Exam Guidelines */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Practical & Internal Assessment
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {board.practical_exam_info || 'Internal and external laboratory practical evaluations, project submissions, and viva voce conducted prior to theory exams.'}
          </p>
        </div>

        {/* Grading System */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Grading & Evaluation Scheme
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {board.grading_system || 'Standard percentage marks and subject-wise positional grading (A1, A2, B1, etc.).'}
          </p>
        </div>

        {/* Supplementary & Re-evaluation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" /> Supplementary Exam & Re-evaluation
          </h3>
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {board.supplementary_exam_name && (
              <p><strong>Supplementary Exam:</strong> {board.supplementary_exam_name}</p>
            )}
            <p><strong>Revaluation Policy:</strong> {board.revaluation_process_info || 'Official provision for verification of marks, obtaining photocopy of answer books, and re-evaluation.'}</p>
          </div>
        </div>
      </div>

      {/* Associated Examinations */}
      {exams.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-slate-900">
            Associated Board Examinations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exams.map((ex: any) => (
              <Link
                key={ex.id}
                href={`/exams/${ex.slug}`}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{ex.title}</h4>
                  <span className="text-xs text-slate-500 font-semibold">{ex.short_title}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Helplines Footer */}
      <div className="p-5 bg-slate-900 text-white rounded-3xl text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Official Domain: <strong>{board.official_domain}</strong></span>
        </div>
        {board.helpline_number && (
          <div className="flex items-center gap-1.5 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>Official Helpline: {board.helpline_number}</span>
          </div>
        )}
      </div>
    </div>
  );
}
