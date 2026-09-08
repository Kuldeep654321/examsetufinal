import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  BookOpen,
  Sparkles,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import { DailyGKCapsule } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Daily GK & Current Affairs Capsules for Competitive Exams - ExamSetu',
  description: 'Verified daily general knowledge notes and current affairs summaries relevant for UPSC CSE, SSC CGL, IBPS PO, RRB, and State PSC exams.',
};

async function getGKCapsules() {
  const res = await query(
    `SELECT * FROM daily_gk_capsules ORDER BY published_date DESC, created_at DESC LIMIT 30`
  );
  return res.rows as DailyGKCapsule[];
}

export default async function DailyGKPage() {
  const capsules = await getGKCapsules();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Daily Current Affairs & GK</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Curated for UPSC, SSC, Banking & PSC Exams</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Daily GK Capsules & Current Affairs Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Concise, fact-checked daily summaries of major national developments, government notifications, space missions, and economic reforms mapped directly to competitive exam syllabi.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href="/exams"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition text-center shadow-lg"
          >
            Explore Exam Syllabus & Dates
          </Link>
        </div>
      </div>

      {/* Capsules Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Latest Verified GK Capsules ({capsules.length})
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Updated daily by our exam verifiers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capsules.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.published_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.summary}
                </p>

                {/* Key Exam Takeaways */}
                {item.key_takeaways && item.key_takeaways.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <strong className="text-slate-800 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-indigo-900">
                      🎯 Key Exam Takeaways:
                    </strong>
                    <ul className="space-y-1 text-slate-600">
                      {item.key_takeaways.map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Relevant Exams Tags & Source Link */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  {item.relevant_exams?.map((ex: string) => (
                    <span key={ex} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                      {ex}
                    </span>
                  ))}
                </div>

                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Official Release <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
