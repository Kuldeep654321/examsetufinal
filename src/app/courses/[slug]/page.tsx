import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import {
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Clock,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface PageProps {
  params: { slug: string };
}

async function getCourseData(slug: string) {
  const res = await query(
    `SELECT
      c.id,
      c.name,
      c.short_name,
      c.slug,
      c.degree_level,
      c.stream,
      c.duration_years,
      c.eligibility_summary,
      c.stream_prerequisites,
      c.lateral_entry_available,
      c.regulatory_body,
      c.accepted_entrance_exams,
      c.counselling_routes,
      c.career_scope,
      c.top_specializations,
      c.is_verified,
      c.last_verified_at
    FROM courses c
    WHERE c.slug = $1`,
    [slug]
  );

  if (res.rows.length === 0) return null;
  return res.rows[0];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await getCourseData(params.slug);
  if (!course) return { title: 'Course Not Found - ExamSetu' };

  return {
    title: `${course.name} (${course.short_name}) - Eligibility, Duration, Entrance Exams & Scope | ExamSetu`,
    description: `Official statutory course details for ${course.name} (${course.short_name}). Eligibility prerequisites, regulatory apex body (${course.regulatory_body}), duration (${course.duration_years} years), accepted entrance exams, and career pathways.`,
    alternates: {
      canonical: `https://examsetu.in/courses/${params.slug}`,
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const course = await getCourseData(params.slug);
  if (!course) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/courses" className="hover:text-blue-600">Courses Directory</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate max-w-xs">{course.short_name}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-emerald-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            {course.degree_level} Degree • {course.stream}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Statutory Recognized Degree
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          {course.name} ({course.short_name})
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {course.career_scope}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-emerald-400" /> Duration: <strong>{course.duration_years} Years</strong>
          </span>
          {course.regulatory_body && (
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Regulatory Body: <strong>{course.regulatory_body}</strong>
            </span>
          )}
          {course.lateral_entry_available && (
            <span className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Lateral Entry Available
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Eligibility & Prerequisites */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Eligibility & Prerequisites
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {course.eligibility_summary}
          </p>
          {course.stream_prerequisites && course.stream_prerequisites.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Required 10+2 Streams:</span>
              <div className="flex flex-wrap gap-1.5">
                {course.stream_prerequisites.map((sp: string) => (
                  <span key={sp} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accepted Entrance Exams */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Accepted Entrance Examinations
          </h3>
          {course.accepted_entrance_exams && course.accepted_entrance_exams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.accepted_entrance_exams.map((ex: string) => (
                <div key={ex} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs font-bold text-blue-900 flex items-center justify-between">
                  <span>{ex}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              Admission through merit in qualifying board examination or institutional entrance tests.
            </p>
          )}

          {course.counselling_routes && course.counselling_routes.length > 0 && (
            <div className="pt-2 space-y-1.5 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">Counselling Systems:</span>
              <div className="flex flex-wrap gap-1.5">
                {course.counselling_routes.map((cr: string) => (
                  <span key={cr} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200">
                    {cr}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Specializations */}
        {course.top_specializations && course.top_specializations.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Popular Specializations & Branches
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {course.top_specializations.map((spec: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-800">
                  {spec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career & Progression */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" /> Career Pathways & Scope
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {course.career_scope}
          </p>
          <div className="pt-2">
            <Link
              href={`/career-pathways?q=${encodeURIComponent(course.short_name)}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
            >
              Explore Full Career Pathway <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
