import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, DollarSign, MapPin, Award } from 'lucide-react';
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
    : 'Ongoing / Announced';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              {opp.opp_type}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {opp.org?.short_name || 'Government / Entity'}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              opp.status === 'open'
                ? 'bg-emerald-100 text-emerald-800'
                : isClosingSoon
                ? 'bg-red-100 text-red-800 animate-pulse'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {opp.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title */}
        <Link href={`/opportunities/${opp.slug}`}>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
            {opp.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {opp.description}
        </p>

        {/* Financial Aid / Benefits Highlight */}
        {opp.financial_aid_amount && (
          <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Value / Aid:
            </span>
            <span className="font-bold text-emerald-700 text-sm">{opp.financial_aid_amount}</span>
          </div>
        )}

        {/* Eligibility & Location */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-600">
          <p className="flex items-center gap-1.5 truncate">
            <strong className="text-slate-800">Eligibility:</strong> {opp.qualification}
          </p>
          <p className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Deadline: <strong className="text-slate-800">{deadlineStr}</strong></span>
            {opp.is_deadline_extended && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded">
                Extended
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Opportunity
        </span>

        <Link
          href={`/opportunities/${opp.slug}`}
          className="font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1"
        >
          Check Eligibility <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
