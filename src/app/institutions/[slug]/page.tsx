import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import {
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MapPin,
  BookOpen,
  GraduationCap,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PageProps {
  params: { slug: string };
}

async function getInstitutionData(slug: string) {
  const res = await query(
    `SELECT
      i.id,
      i.name,
      i.short_name,
      i.slug,
      i.institution_type,
      i.state_name,
      i.city,
      i.official_website,
      i.affiliation,
      i.recognized_by,
      i.accepted_exams,
      i.counselling_authorities,
      i.courses_offered,
      i.campus_overview,
      i.is_verified,
      i.last_verified_at
    FROM institutions i
    WHERE i.slug = $1`,
    [slug]
  );

  if (res.rows.length === 0) return null;
  return res.rows[0];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const inst = await getInstitutionData(params.slug);
  if (!inst) return { title: 'Institution Not Found - ExamSetu' };

  return {
    title: `${inst.name} (${inst.short_name}) - Accepted Exams, Counselling & Courses | ExamSetu`,
    description: `Official profile for ${inst.name} (${inst.short_name}), ${inst.city}, ${inst.state_name}. Recognized by ${inst.recognized_by}. View accepted entrance exams, counselling bodies (${inst.counselling_authorities?.join(', ')}), and degree courses offered.`,
    alternates: {
      canonical: `https://examsetu.in/institutions/${params.slug}`,
    },
  };
}

export default async function InstitutionDetailPage({ params }: PageProps) {
  const inst = await getInstitutionData(params.slug);
  if (!inst) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/institutions" className="hover:text-blue-600">Institutions & Colleges</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate max-w-xs">{inst.short_name}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-blue-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {inst.institution_type.replace('_', ' ')} • {inst.city}, {inst.state_name}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> {inst.recognized_by || 'UGC Recognized'}
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          {inst.name} ({inst.short_name})
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {inst.campus_overview}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={inst.official_website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            Visit Official Institute Portal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accepted Exams */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Accepted Entrance Examinations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {inst.accepted_exams?.map((ex: string) => (
              <div key={ex} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs font-bold text-blue-900">
                {ex}
              </div>
            ))}
          </div>

          {inst.counselling_authorities && inst.counselling_authorities.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Admission & Counselling Systems:</span>
              <div className="flex flex-wrap gap-1.5">
                {inst.counselling_authorities.map((ca: string) => (
                  <span key={ca} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200">
                    {ca}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Courses Offered */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" /> Key Degree Programs & Courses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {inst.courses_offered?.map((course: string) => (
              <div key={course} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                {course}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
            <strong>Affiliation / Status:</strong> {inst.affiliation}
          </div>
        </div>
      </div>
    </div>
  );
}
