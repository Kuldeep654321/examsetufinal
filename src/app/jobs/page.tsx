import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  Briefcase,
  Search,
  Filter,
  Users,
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { OppCard } from '@/components/opportunities/OppCard';
import { Opportunity } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Latest Government Job Vacancies 2026 (Sarkari Naukri) - ExamSetu',
  description: 'Verified Government Job vacancies across SSC, UPSC, Railways, Banking, Defence, State PSCs, and PSUs with official vacancy counts and direct apply links.',
};

async function getJobVacancies() {
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
          WHEN opp.application_deadline IS NOT NULL AND CURRENT_DATE > opp.application_deadline THEN 'closed'::opp_status
          WHEN opp.application_deadline IS NOT NULL AND CURRENT_DATE >= opp.application_deadline - INTERVAL '3 days' AND CURRENT_DATE <= opp.application_deadline THEN 'closing_soon'::opp_status
          WHEN (opp.application_start IS NOT NULL AND CURRENT_DATE >= opp.application_start AND (opp.application_deadline IS NULL OR CURRENT_DATE <= opp.application_deadline)) THEN 'open'::opp_status
          WHEN opp.application_start IS NOT NULL AND CURRENT_DATE < opp.application_start THEN 'upcoming'::opp_status
          ELSE opp.status
        END
      ) as status,
      opp.last_verified_at,
      opp.is_featured,
      opp.created_at,
      json_build_object(
        'id', o.id,
        'name', o.name,
        'short_name', o.short_name,
        'slug', o.slug,
        'official_domain', o.official_domain,
        'logo_url', o.logo_url
      ) as org
    FROM opportunities opp
    JOIN organizations o ON opp.org_id = o.id
    WHERE opp.opp_type = 'job'
    ORDER BY opp.is_featured DESC, opp.application_deadline ASC NULLS LAST`
  );
  return res.rows as Opportunity[];
}

export default async function JobsPage() {
  const jobs = await getJobVacancies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Government Job Vacancies</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Official Sarkari Naukri Intelligence Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Latest Government Job Vacancies (2026)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Direct notifications for Group A, Group B, and Group C recruitment notices from Central Ministries, SSC, UPSC, Indian Railways, Public Sector Banks, and State Commissions.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href="/tools/salary-calculator"
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
          >
            <DollarSign className="w-4 h-4" /> 7th CPC Salary Calculator
          </Link>
          <Link
            href="/internships"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition text-center"
          >
            Explore National Internships →
          </Link>
        </div>
      </div>

      {/* Job Vacancies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Active Government Recruitments ({jobs.length})
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Updated hourly with official gazette releases
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <OppCard key={job.id} opp={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
