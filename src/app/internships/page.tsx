import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  GraduationCap,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Banknote
} from 'lucide-react';
import { OppCard } from '@/components/opportunities/OppCard';
import { Opportunity } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Government & National Internships 2026 - NITI Aayog, RBI, MEA, ISRO - ExamSetu',
  description: 'Verified policy, research, scientific, and corporate internships in India with monthly stipends up to ₹45,000 and direct application links.',
};

async function getInternships() {
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
    WHERE opp.opp_type = 'internship'
    ORDER BY opp.is_featured DESC, opp.application_deadline ASC NULLS LAST`
  );
  return res.rows as Opportunity[];
}

export default async function InternshipsPage() {
  const internships = await getInternships();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Student & Research Internships</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Prestige Government & Research Schemes</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            National & Policy Internships (2026)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Gain high-impact experience with NITI Aayog, Reserve Bank of India (RBI ₹45,000/mo), Ministry of External Affairs (MEA), ISRO, DRDO, and the Parliament of India.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href="/opportunities"
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition text-center shadow-lg"
          >
            All Scholarships & Fellowships
          </Link>
          <Link
            href="/jobs"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition text-center"
          >
            View Sarkari Job Vacancies →
          </Link>
        </div>
      </div>

      {/* Internships Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> Active Internship Schemes ({internships.length})
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            All programs vetted for official institutional credentials
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <OppCard key={internship.id} opp={internship} />
          ))}
        </div>
      </div>
    </div>
  );
}
