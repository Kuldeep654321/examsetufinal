import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import {
  Sparkles,
  Award,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  FileText,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { VerifiedBadge } from '@/components/exams/VerifiedBadge';

interface PageProps {
  params: { slug: string };
}

async function getOppData(slug: string) {
  const res = await query(
    `SELECT
      opp.id,
      opp.slug,
      opp.title,
      opp.opp_type,
      opp.description,
      opp.eligibility,
      opp.qualification,
      opp.min_age,
      opp.max_age,
      opp.location,
      opp.stream,
      opp.application_start,
      opp.application_deadline,
      opp.is_deadline_extended,
      opp.previous_deadline,
      opp.benefits,
      opp.financial_aid_amount,
      opp.vacancies_count,
      opp.salary_range,
      opp.stipend_amount,
      opp.department,
      opp.role_designation,
      opp.application_process,
      opp.official_source_url,
      opp.official_portal_link,
      opp.documents_required,
        (
          CASE
            WHEN opp.application_deadline IS NOT NULL AND CURRENT_DATE > opp.application_deadline THEN 'closed'
            WHEN opp.application_deadline IS NOT NULL AND CURRENT_DATE >= opp.application_deadline - INTERVAL '3 days' AND CURRENT_DATE <= opp.application_deadline THEN 'closing_soon'
            WHEN (opp.application_start IS NOT NULL AND CURRENT_DATE >= opp.application_start AND (opp.application_deadline IS NULL OR CURRENT_DATE <= opp.application_deadline)) THEN 'open'
            WHEN opp.application_start IS NOT NULL AND CURRENT_DATE < opp.application_start THEN 'upcoming'
            ELSE opp.status
          END
        ) as status,
      opp.last_verified_at,
      opp.is_featured,
      json_build_object(
        'id', o.id,
        'name', o.name,
        'short_name', o.short_name,
        'official_domain', o.official_domain,
        'description', o.description,
        'official_portal_url', o.official_portal_url
      ) as org
    FROM opportunities opp
    JOIN organizations o ON opp.org_id = o.id
    WHERE opp.slug = $1`,
    [slug]
  );

  return res.rows[0] || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const opp = await getOppData(params.slug);
  if (!opp) return { title: 'Opportunity Not Found - ExamSetu' };

  return {
    title: `${opp.title} - Official Eligibility, Benefits & Application | ExamSetu`,
    description: `Official guidelines for ${opp.title}. Financial aid: ${opp.financial_aid_amount || 'Merit support'}. Application deadline: ${opp.application_deadline || 'Open'}.`,
    alternates: {
      canonical: `https://examsetu.in/opportunities/${opp.slug}`,
    },
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const opp = await getOppData(params.slug);
  if (!opp) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/opportunities" className="hover:text-blue-600">Opportunities</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate max-w-xs">{opp.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <VerifiedBadge orgName={opp.org?.short_name} verifiedAt={opp.last_verified_at} />
          <span className="text-xs font-bold uppercase px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
            {opp.opp_type}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {opp.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
          <span>Authority: <strong>{opp.org?.name}</strong></span>
          <span>•</span>
          <span>Location: <strong>{opp.location || 'All India'}</strong></span>
        </div>
      </div>

      {/* Financial Aid & Deadline Highlight Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-md space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase">
            <Award className="w-4 h-4" /> {opp.opp_type === 'job' ? 'Pay Scale & Remuneration' : opp.opp_type === 'internship' ? 'Stipend & Perks' : 'Financial Aid / Fellowship'}
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {opp.salary_range || opp.stipend_amount || opp.financial_aid_amount || '7th CPC Notified / Merit Grant'}
          </p>
          {opp.vacancies_count && (
            <div className="text-xs text-blue-200 font-bold pt-1">
              🎯 Total Vacancies: {opp.vacancies_count}
            </div>
          )}
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            {opp.benefits || opp.description}
          </p>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase">
              <Calendar className="w-4 h-4" /> Official Application Deadline
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {opp.application_deadline
                ? new Date(opp.application_deadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Not Announced / Rolling (Check Notification)'}
            </p>
            {opp.is_deadline_extended && (
              <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 bg-orange-500 text-white rounded">
                ⚡ Application Deadline Extended
              </span>
            )}
          </div>

          <div className="pt-4 flex items-center gap-3">
            <a
              href={opp.official_portal_link || opp.official_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              Apply on Official Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Eligibility & Qualifications */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" /> Eligibility Criteria & Requirements
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
          {opp.eligibility}
        </div>
      </section>

      {/* Application Process */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> How to Apply
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
          {opp.application_process}
        </div>
      </section>

      {/* Required Documents Checklist */}
      {opp.documents_required && opp.documents_required.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Mandatory Documents Required
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {opp.documents_required.map((doc: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Official Guidelines & Dual Verification Citation Box */}
      <div className="p-5 bg-slate-900 text-white rounded-3xl text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Official Originating Authority: {opp.org?.name}</span>
          </div>
          <span className="text-slate-400">
            Last Verified: {opp.last_verified_at ? new Date(opp.last_verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-2xl">
            This record has undergone ExamSetu's Dual-Check Verification Protocol against official government gazettes, press notes, and authority portals.
          </p>
          <a
            href={opp.official_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold rounded-xl border border-slate-700 transition"
          >
            Official Document / Gazette Link <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
