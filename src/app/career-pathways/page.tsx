import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  Compass,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Building2,
  Cpu,
  Activity,
  Scale,
  ShieldCheck,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { StudentPathway } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'India Student Pathway Engine & Career Roadmaps - ExamSetu',
  description: 'Verified official education pathways from Class 10, Class 12 (PCM/PCB/Commerce/Arts), Polytechnic, and Graduation to Entrance Exams, Counselling, Colleges, Degrees, and Government Jobs.',
  alternates: {
    canonical: 'https://examsetu.in/career-pathways',
  },
};

async function getPathwaysData(): Promise<StudentPathway[]> {
  const res = await query(
    `SELECT
      p.id,
      p.stage_from,
      p.title,
      p.slug,
      p.category,
      p.summary,
      p.flow_stages,
      p.entrance_exams,
      p.counselling_systems,
      p.courses_accessible,
      p.institutions_types,
      p.career_outcomes,
      p.govt_exam_eligibility,
      p.is_verified,
      p.last_verified_at
    FROM student_pathways p
    WHERE p.is_verified = true
    ORDER BY p.id ASC`
  );
  return res.rows;
}

export default async function CareerPathwaysPage({
  searchParams,
}: {
  searchParams?: { stage?: string };
}) {
  const pathways = await getPathwaysData();

  const selectedStage = searchParams?.stage || 'Class 10';
  const activePathway =
    pathways.find((p) => p.stage_from.toLowerCase() === selectedStage.toLowerCase()) ||
    pathways[0];

  const stagesList = [
    { label: 'After Class 10', value: 'Class 10', icon: '🏫' },
    { label: 'Class 12 (PCM)', value: 'Class 12 (PCM)', icon: '⚙️' },
    { label: 'Class 12 (PCB)', value: 'Class 12 (PCB)', icon: '🩺' },
    { label: 'Class 12 (Commerce)', value: 'Class 12 (Commerce)', icon: '📈' },
    { label: 'Class 12 (Arts)', value: 'Class 12 (Arts/Humanities)', icon: '⚖️' },
    { label: 'After B.Tech (Engineering)', value: 'UG Engineering (B.Tech)', icon: '💻' },
    { label: 'After Any Graduation', value: 'Graduation (Any Stream)', icon: '🏛️' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Student Pathways Engine</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-blue-900/50">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>Verified India Education & Career Decision Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          What Can I Do After My Current Education Level?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Select your current stage to discover verified entrance examinations, official counselling systems, eligible undergraduate/postgraduate degrees, participating institutions, and central/state government recruitment pathways.
        </p>

        {/* Quick Stage Switcher Tabs */}
        <div className="pt-4 flex flex-wrap gap-2">
          {stagesList.map((st) => {
            const isActive =
              activePathway?.stage_from.toLowerCase() === st.value.toLowerCase();
            return (
              <Link
                key={st.value}
                href={`/career-pathways?stage=${encodeURIComponent(st.value)}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Pathway Detail Section */}
      {activePathway && (
        <div className="space-y-8">
          {/* Main Stage Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  Current Level: {activePathway.stage_from}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {activePathway.title}
                </h2>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Authority Roadmap</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {activePathway.summary}
            </p>
          </div>

          {/* Sequential Step-by-Step Flow Stages */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> Sequential Decision & Progression Flow
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-6">
              {activePathway.flow_stages?.map((flow, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                    {idx + 1}
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-blue-700">
                        {flow.level}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900">
                      {flow.step_title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {flow.description}
                    </p>

                    <div className="pt-2 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Verified Routes & Options:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-800">
                        {flow.options?.map((opt, oIdx) => (
                          <li key={oIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Column Matrix: Exams, Counselling, Courses, Government Eligibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* National & State Entrance Exams */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-blue-900 pb-2 border-b border-slate-100">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="font-black text-sm">Relevant Entrance & Admission Exams</h4>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {activePathway.entrance_exams?.map((ex) => (
                  <Link
                    key={ex}
                    href={`/exams?q=${encodeURIComponent(ex)}`}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1"
                  >
                    <span>{ex}</span>
                    <ArrowRight className="w-3 h-3 text-blue-500" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Official Counselling Systems */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-indigo-900 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="font-black text-sm">Official Counselling Authorities</h4>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {activePathway.counselling_systems?.map((cs) => (
                  <Link
                    key={cs}
                    href={`/counselling?q=${encodeURIComponent(cs)}`}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center gap-1"
                  >
                    <span>{cs}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Degrees & Programs Accessible */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-emerald-900 pb-2 border-b border-slate-100">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h4 className="font-black text-sm">Recognized Courses & Degrees</h4>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {activePathway.courses_accessible?.map((cr) => (
                  <Link
                    key={cr}
                    href={`/courses?q=${encodeURIComponent(cr)}`}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition"
                  >
                    {cr}
                  </Link>
                ))}
              </div>
            </div>

            {/* Government Exam Eligibility */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 pb-2 border-b border-slate-100">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <h4 className="font-black text-sm">Government Recruitment Eligibility</h4>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {activePathway.govt_exam_eligibility?.map((g) => (
                  <Link
                    key={g}
                    href={`/jobs?q=${encodeURIComponent(g)}`}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition flex items-center gap-1"
                  >
                    <span>{g}</span>
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Long-Term Career Horizons Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
            <h4 className="text-base sm:text-lg font-black flex items-center gap-2 text-emerald-400">
              <Award className="w-5 h-5" /> Long-Term Career & Professional Horizons
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activePathway.career_outcomes?.map((co, cIdx) => (
                <div key={cIdx} className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200">{co}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
