import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Award,
  Briefcase,
  Layers,
  Building2,
  Clock,
  ExternalLink,
  Users,
  Banknote
} from 'lucide-react';
import { Opportunity } from '@/types';

interface OppCardProps {
  opp: Opportunity;
}

export function OppCard({ opp }: OppCardProps) {
  const isClosingSoon = opp.status === 'closing_soon';
  const deadlineStr = opp.application_deadline
    ? new Date(opp.application_deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Ongoing / Not Announced';

  const isJob = opp.opp_type === 'job';
  const isInternship = opp.opp_type === 'internship';
  const isScholarship = opp.opp_type === 'scholarship';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {/* Top Banner Stripe */}
      {isJob && (
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
      )}
      {isInternship && (
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500" />
      )}
      {isScholarship && (
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />
      )}

      <div className="p-5 sm:p-6 space-y-3.5">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                isJob
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : isInternship
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isJob ? '💼 Govt Job' : isInternship ? '🎓 Internship' : '💰 Scholarship'}
            </span>
            <span className="text-xs font-semibold text-slate-500 truncate max-w-[140px]">
              {opp.org?.short_name || 'Government of India'}
            </span>
          </div>

          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              opp.status === 'open'
                ? 'bg-emerald-100 text-emerald-800'
                : isClosingSoon
                ? 'bg-rose-100 text-rose-800 animate-pulse'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {opp.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title */}
        <Link href={`/opportunities/${opp.slug}`}>
          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
            {opp.title}
          </h3>
        </Link>

        {/* Department / Ministry */}
        {opp.department && (
          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{opp.department}</span>
          </p>
        )}

        {/* Highlight Banner (Vacancies / Stipend / Aid) */}
        {opp.vacancies_count && isJob && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Total Vacancies:
            </span>
            <span className="font-black text-blue-700 text-sm">{opp.vacancies_count}</span>
          </div>
        )}

        {opp.stipend_amount && isInternship && (
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-purple-600" /> Stipend / Perks:
            </span>
            <span className="font-black text-purple-700 text-sm">{opp.stipend_amount}</span>
          </div>
        )}

        {opp.financial_aid_amount && !isJob && !opp.stipend_amount && (
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Grant / Aid:
            </span>
            <span className="font-black text-emerald-700 text-sm">{opp.financial_aid_amount}</span>
          </div>
        )}

        {/* Pay Scale for Jobs */}
        {opp.salary_range && isJob && (
          <p className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            💵 <strong>Pay Scale:</strong> {opp.salary_range}
          </p>
        )}

        {/* Eligibility & Qualifications */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          <p className="flex items-start gap-1.5 line-clamp-2">
            <strong className="text-slate-800 shrink-0">Qualification:</strong> {opp.qualification}
          </p>
          <p className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Apply Before: <strong className="text-slate-800">{deadlineStr}</strong></span>
            {opp.is_deadline_extended && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                Extended
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Official Source Verified
        </span>

        <Link
          href={`/opportunities/${opp.slug}`}
          className="font-black text-blue-600 group-hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          View Details & Apply <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
