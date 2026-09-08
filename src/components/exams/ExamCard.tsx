import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, ShieldCheck, Clock, MapPin, Award, Layers } from 'lucide-react';
import { Exam } from '@/types';

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  // Find current active or next event
  const activeEvent = exam.events?.find((e) => e.status === 'open' || e.status === 'closing_soon') || exam.events?.[0];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* Card Header: Conducting Org & Level */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              {exam.conducting_org?.short_name || 'Official Body'}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {exam.level} Level
            </span>
          </div>

          {exam.is_featured && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
              ★ Featured
            </span>
          )}
        </div>

        {/* Exam Title */}
        <Link href={`/exams/${exam.slug}`}>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
            {exam.title}
          </h3>
        </Link>

        {/* Eligibility summary */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {exam.eligibility_criteria}
        </p>

        {/* Active Event Status Ribbon */}
        {activeEvent && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 block truncate max-w-[170px] sm:max-w-[200px]">
                  {activeEvent.title}
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeEvent.end_date
                    ? `Deadline: ${new Date(activeEvent.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : 'Schedule to be announced'}
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                activeEvent.status === 'open'
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeEvent.status === 'closing_soon'
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeEvent.status.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Streams and Category tags */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {exam.stream_eligibility?.map((st) => (
            <span
              key={st}
              className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
            >
              Stream: {st}
            </span>
          ))}
          {exam.category && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
              {exam.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
        </span>

        <Link
          href={`/exams/${exam.slug}`}
          className="font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1"
        >
          View Full Details <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
