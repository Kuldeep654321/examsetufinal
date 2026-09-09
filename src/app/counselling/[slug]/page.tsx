import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import {
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  HelpCircle,
  Phone,
  Mail,
  Users
} from 'lucide-react';

interface PageProps {
  params: { slug: string };
}

async function getCounsellingData(slug: string) {
  // First try authority slug
  const authRes = await query(
    `SELECT
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
    WHERE ca.slug = $1`,
    [slug]
  );

  if (authRes.rows.length > 0) {
    const auth = authRes.rows[0];
    const procRes = await query(
      `SELECT
        id, title, slug, cycle_year, official_portal_url, notification_url,
        process_overview, eligibility_summary, reservation_summary,
        rounds_structure, step_by_step_process, required_documents,
        seat_matrix_info, fees_info, status
      FROM counselling_processes
      WHERE authority_id = $1 OR authority_id = $2`,
      [auth.id, auth.slug]
    );

    return {
      type: 'authority',
      data: {
        ...auth,
        processes: procRes.rows,
      },
    };
  }

  // Try process slug
  const procRes = await query(
    `SELECT
      id, authority_id, cycle_year, title, slug, official_portal_url,
      notification_url, process_overview, eligibility_summary, reservation_summary,
      rounds_structure, step_by_step_process, required_documents,
      seat_matrix_info, fees_info, status, last_verified_at
    FROM counselling_processes
    WHERE slug = $1`,
    [slug]
  );

  if (procRes.rows.length > 0) {
    const proc = procRes.rows[0];
    const authorityRes = await query(
      `SELECT
        id, name, short_name, slug, stream, jurisdiction, conducting_body,
        official_website, official_domain, helpline_number, contact_email
      FROM counselling_authorities
      WHERE id = $1 OR slug = $1`,
      [proc.authority_id]
    );

    return {
      type: 'process',
      data: {
        ...proc,
        authority: authorityRes.rows[0] || {
          name: proc.title,
          short_name: proc.slug,
          stream: 'National',
          jurisdiction: 'All India',
          conducting_body: 'Official Authority',
          official_website: proc.official_portal_url,
          official_domain: 'gov.in',
        },
      },
    };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getCounsellingData(params.slug);
  if (!item) return { title: 'Counselling Process Not Found - ExamSetu' };

  const title =
    item.type === 'process'
      ? item.data.title
      : `${item.data.name} (${item.data.short_name}) Seat Allocation & Admission Rules`;

  return {
    title: `${title} - ExamSetu`,
    description: `Official step-by-step seat allocation rules, eligibility criteria, round schedules, document checklist, and fee structure for ${title}.`,
    alternates: {
      canonical: `https://examsetu.in/counselling/${params.slug}`,
    },
  };
}

export default async function CounsellingDetailPage({ params }: PageProps) {
  const result = await getCounsellingData(params.slug);
  if (!result) notFound();

  const isProcess = result.type === 'process';
  const proc = isProcess ? result.data : result.data.processes?.[0];
  const auth = isProcess ? result.data.authority : result.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/counselling" className="hover:text-blue-600">Counselling Systems</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate max-w-xs">{auth.short_name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-indigo-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            {auth.stream} Stream • {auth.jurisdiction}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Official Verified Body
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          {proc ? proc.title : `${auth.name} (${auth.short_name})`}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {proc ? proc.process_overview : auth.description}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={proc?.official_portal_url || auth.official_website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            Official Portal ({auth.official_domain}) <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {proc?.notification_url && (
            <a
              href={proc.notification_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/15 transition flex items-center gap-2"
            >
              Official Business Rules PDF <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {proc && (
        <div className="space-y-8">
          {/* Eligibility & Reservation Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> Eligibility Criteria
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {proc.eligibility_summary}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Reservation & Quota Rules
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {proc.reservation_summary || 'Standard Central Govt reservation quotas apply (SC: 15%, ST: 7.5%, OBC-NCL: 27%, EWS: 10%, PwD: 5%).'}
              </p>
            </div>
          </div>

          {/* Sequential Step-by-Step Guide */}
          {proc.step_by_step_process && proc.step_by_step_process.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" /> Step-by-Step Seat Allocation Process
              </h3>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 space-y-6">
                {proc.step_by_step_process.map((step: any, sIdx: number) => (
                  <div key={sIdx} className="relative">
                    <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      {step.step || sIdx + 1}
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
                      <h4 className="font-bold text-base text-slate-900">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                      {step.action_required && (
                        <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900 font-semibold mt-2">
                          <strong>Candidate Action:</strong> {step.action_required}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Rounds Structure & Mechanics */}
          {proc.rounds_structure && proc.rounds_structure.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" /> Official Counselling Rounds & Seat Rules
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Multi-tier round structure, actual session schedules, and round-wise seat progression rules.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                      proc.status === 'concluded' || proc.status === 'completed'
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : proc.status === 'ongoing' || proc.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    Cycle Status: {proc.status === 'concluded' ? 'Concluded / Closed' : proc.status === 'ongoing' ? 'Active / In Progress' : 'Schedule Awaited'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proc.rounds_structure.map((round: any, rIdx: number) => {
                  const isCompleted = round.status === 'completed' || round.status === 'concluded';
                  const isOngoing = round.status === 'ongoing' || round.status === 'active';
                  const isUpcoming = round.status === 'upcoming';

                  return (
                    <div
                      key={rIdx}
                      className={`p-5 rounded-2xl border space-y-2.5 transition ${
                        isOngoing
                          ? 'bg-emerald-50/50 border-emerald-200 ring-1 ring-emerald-400/50 shadow-sm'
                          : isCompleted
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-amber-50/40 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isOngoing ? 'bg-emerald-500 animate-pulse' : isCompleted ? 'bg-slate-400' : 'bg-amber-400'}`} />
                          {round.name}
                        </h4>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isOngoing
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCompleted
                              ? 'bg-slate-200 text-slate-700'
                              : isUpcoming
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isOngoing
                            ? 'Ongoing / Active'
                            : isCompleted
                            ? 'Completed / Concluded'
                            : isUpcoming
                            ? 'Upcoming Round'
                            : 'Schedule Awaited'}
                        </span>
                      </div>

                      {round.schedule_dates && (
                        <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 bg-white/80 p-2 rounded-lg border border-slate-200/60">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Dates: <strong>{round.schedule_dates}</strong></span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {round.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                        <strong>Seat Rules:</strong> {round.rules_summary}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mandatory Documents Checklist */}
          {proc.required_documents && proc.required_documents.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" /> Mandatory Documents Required for Verification
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                {proc.required_documents.map((doc: string, dIdx: number) => (
                  <li key={dIdx} className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seat Matrix & Fee Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {proc.seat_matrix_info && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Seat Matrix & Availability
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {proc.seat_matrix_info}
                </p>
              </div>
            )}

            {proc.fees_info && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Seat Acceptance & Counselling Fees
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {proc.fees_info}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helplines & Contact Footer */}
      <div className="p-5 bg-slate-900 text-white rounded-3xl text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Official Conducting Body: {auth.conducting_body}</span>
          </div>
          <span className="text-slate-400">
            Last Verified: {auth.last_verified_at ? new Date(auth.last_verified_at).toLocaleDateString('en-IN') : 'Verified'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-300 pt-1">
          {auth.helpline_number && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" /> Helpline: {auth.helpline_number}
            </span>
          )}
          {auth.contact_email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Support Email: {auth.contact_email}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
