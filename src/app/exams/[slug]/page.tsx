import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Download,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  Bookmark,
  Share2,
  FileCheck2
} from 'lucide-react';
import { VerifiedBadge } from '@/components/exams/VerifiedBadge';
import { OfficialSourceBox } from '@/components/exams/OfficialSourceBox';
import { EventTimeline } from '@/components/exams/EventTimeline';
import { ExamTrackerButton } from './ExamTrackerButton';

interface PageProps {
  params: { slug: string };
}

async function getExamData(slug: string) {
  const res = await query(
    `SELECT
      e.id,
      e.slug,
      e.title,
      e.short_title,
      e.level,
      e.stream_eligibility,
      e.min_age,
      e.max_age,
      e.age_relaxation,
      e.eligibility_criteria,
      e.exam_frequency,
      e.official_website_url,
      e.registration_url,
      e.syllabus_url,
      e.exam_pattern,
      e.important_documents,
      e.faqs,
      e.is_featured,
      e.last_verified_at,
      e.created_at,
      e.updated_at,
      json_build_object(
        'id', o.id,
        'name', o.name,
        'short_name', o.short_name,
        'slug', o.slug,
        'official_domain', o.official_domain,
        'description', o.description,
        'logo_url', o.logo_url,
        'official_portal_url', o.official_portal_url,
        'helpline_number', o.helpline_number,
        'contact_email', o.contact_email,
        'is_verified', o.is_verified
      ) as conducting_org,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug,
        'icon', c.icon
      ) as category
    FROM exams e
    JOIN organizations o ON e.conducting_org_id = o.id
    JOIN categories c ON e.category_id = c.id
    WHERE e.slug = $1 AND e.is_active = true`,
    [slug]
  );

  if (res.rows.length === 0) return null;

  const exam = res.rows[0];

  const eventsRes = await query(
    `SELECT id, cycle_year, event_type, title, start_date, end_date, is_extended, previous_end_date, status, official_source_url, notification_doc_url, notes, last_verified_at
     FROM exam_events
     WHERE exam_id = $1
     ORDER BY start_date ASC NULLS LAST`,
    [exam.id]
  );

  const updatesRes = await query(
    `SELECT id, title, summary, old_value, new_value, update_type, official_source_url, official_doc_ref, is_breaking, published_at
     FROM exam_updates
     WHERE exam_id = $1
     ORDER BY published_at DESC`,
    [exam.id]
  );

  return {
    ...exam,
    events: eventsRes.rows,
    updates: updatesRes.rows,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const exam = await getExamData(params.slug);
  if (!exam) return { title: 'Exam Not Found - ExamSetu' };

  return {
    title: `${exam.title} - Official Dates, Syllabus, Eligibility & Schedule | ExamSetu`,
    description: `Official intelligence for ${exam.title} conducted by ${exam.conducting_org?.name}. Verified application deadlines, syllabus PDF, exam pattern, and result dates.`,
    alternates: {
      canonical: `https://examsetu.in/exams/${exam.slug}`,
    },
    openGraph: {
      title: `${exam.title} - Verified Dates & Schedule`,
      description: exam.eligibility_criteria,
      url: `https://examsetu.in/exams/${exam.slug}`,
      siteName: 'ExamSetu',
    },
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const exam = await getExamData(params.slug);
  if (!exam) notFound();

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: exam.title,
    credentialCategory: exam.level,
    recognizedBy: {
      '@type': 'EducationalOrganization',
      name: exam.conducting_org?.name,
      url: exam.official_website_url,
    },
    description: exam.eligibility_criteria,
    url: `https://examsetu.in/exams/${exam.slug}`,
  };

  return (
    <>
      {/* JSON-LD Script for SEO Search Engine Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/exams" className="hover:text-blue-600">Examinations</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 truncate max-w-xs">{exam.short_title}</span>
        </nav>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <VerifiedBadge
              orgName={exam.conducting_org?.short_name}
              verifiedAt={exam.last_verified_at}
            />

            <div className="flex items-center space-x-2">
              <ExamTrackerButton examId={exam.id} examTitle={exam.title} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {exam.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
            <span className="font-semibold px-2.5 py-1 bg-slate-100 rounded-lg">
              Conducting Body: <strong>{exam.conducting_org?.name}</strong>
            </span>
            <span className="font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              Level: <strong>{exam.level}</strong>
            </span>
            <span className="font-semibold px-2.5 py-1 bg-slate-100 rounded-lg">
              Frequency: <strong>{exam.exam_frequency}</strong>
            </span>
          </div>
        </div>

        {/* Official Authority Card */}
        {exam.conducting_org && (
          <OfficialSourceBox
            organization={exam.conducting_org}
            officialWebsiteUrl={exam.official_website_url}
            registrationUrl={exam.registration_url}
            syllabusUrl={exam.syllabus_url}
            lastVerifiedAt={exam.last_verified_at}
          />
        )}

        {/* Breaking Updates History Banner */}
        {exam.updates && exam.updates.length > 0 && (
          <div className="bg-amber-50/80 rounded-2xl p-6 border border-amber-200/90 space-y-3">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500 text-white">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Official Notices & Recent Changes
            </h3>

            <div className="space-y-3">
              {exam.updates.map((up: any) => (
                <div key={up.id} className="bg-white p-4 rounded-xl border border-amber-100 text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{up.title}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(up.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{up.summary}</p>
                  {up.new_value && (
                    <div className="pt-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 inline-block">
                      ✓ Verified: {up.new_value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Schedule & Pipeline */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Official Timeline
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Examination Events & Key Dates
            </h2>
            <p className="text-xs text-slate-500">
              Real-time event lifecycle from Registration to Counselling. Unannounced stages are clearly labeled.
            </p>
          </div>

          <EventTimeline events={exam.events} />
        </section>

        {/* Eligibility Criteria & Age Limits */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Eligibility Criteria & Stream Requirements
            </h2>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {exam.eligibility_criteria}
          </div>

          {/* Stream and Age grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Eligible Streams</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exam.stream_eligibility?.map((st: string) => (
                  <span key={st} className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-800">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Age Requirements</span>
              <p className="font-semibold text-slate-800 pt-1">
                {exam.min_age ? `Minimum Age: ${exam.min_age} Years` : 'No minimum age'}
                {exam.max_age ? ` • Maximum Age: ${exam.max_age} Years` : ' • No upper age limit'}
              </p>
            </div>
          </div>
        </section>

        {/* Exam Pattern & Marking Scheme */}
        {exam.exam_pattern && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                <Clock className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Official Exam Pattern & Marking Scheme
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase">Exam Mode</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{exam.exam_pattern.mode}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase">Duration</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{exam.exam_pattern.duration_minutes} Minutes</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Marks</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{exam.exam_pattern.total_marks} Marks</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase">Marking Scheme</span>
                <p className="text-xs font-bold text-slate-900 mt-1">{exam.exam_pattern.negative_marking}</p>
              </div>
            </div>

            {/* Sections table */}
            {exam.exam_pattern.sections && exam.exam_pattern.sections.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-slate-200">Section / Subject</th>
                      <th className="p-3 border-b border-slate-200 text-center">Questions</th>
                      <th className="p-3 border-b border-slate-200 text-right">Maximum Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {exam.exam_pattern.sections.map((sec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold">{sec.name}</td>
                        <td className="p-3 text-center">{sec.questions}</td>
                        <td className="p-3 text-right font-bold text-blue-700">{sec.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Required Documents */}
        {exam.important_documents && exam.important_documents.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Documents Required for Registration
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              {exam.important_documents.map((doc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Frequently Asked Questions (FAQs) */}
        {exam.faqs && exam.faqs.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <HelpCircle className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Frequently Asked Questions ({exam.short_title})
              </h2>
            </div>

            <div className="space-y-4">
              {exam.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900">{faq.question}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
