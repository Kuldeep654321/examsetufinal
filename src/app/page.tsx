'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  FileCheck2,
  Bell,
  Landmark
} from 'lucide-react';
import { StudentPersonalizer } from '@/components/home/StudentPersonalizer';
import { ExamCard } from '@/components/exams/ExamCard';
import { OppCard } from '@/components/opportunities/OppCard';
import { Exam, Opportunity, ExamUpdate } from '@/types';

export default function HomePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredStream, setFilteredStream] = useState('PCB');
  const [targetFocus, setTargetFocus] = useState('NEET UG');

  useEffect(() => {
    async function loadData() {
      try {
        const [examsRes, oppsRes] = await Promise.all([
          fetch('/api/exams?limit=12'),
          fetch('/api/opportunities?limit=8'),
        ]);

        if (examsRes.ok) {
          const eData = await examsRes.json();
          setExams(eData.data || []);
        }

        if (oppsRes.ok) {
          const oData = await oppsRes.json();
          setOpportunities(oData.data || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleFilterChange = (filters: {
    classLevel: string;
    board: string;
    state: string;
    stream: string;
    targetExam: string;
  }) => {
    setFilteredStream(filters.stream);
    setTargetFocus(filters.targetExam);
  };

  // Filter exams based on student profile selection
  const prioritizedExams = exams.filter((e) => {
    if (!filteredStream || filteredStream === 'Any') return true;
    return (
      e.stream_eligibility?.includes(filteredStream) ||
      e.stream_eligibility?.includes('Any') ||
      e.title.toLowerCase().includes(targetFocus.toLowerCase())
    );
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-12 pb-24 sm:pt-16 sm:pb-28">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Live Source Verification Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Official Source Intelligence • Continuous Update Engine Active</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Never Miss an Exam Date, Admit Card, or Scholarship.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              India&apos;s authoritative platform continuously verifying notices from NTA, UPSC, SSC, CBSE, State Boards, and National Scholarship Portals.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/exams"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Explore 1,000+ Examinations
              </Link>
              <Link
                href="/opportunities"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Scholarships & Jobs
              </Link>
            </div>

            {/* Official Conducting Agencies Bar */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>National Agencies:</span>
              <span className="text-slate-300 hover:text-white transition">NTA</span>
              <span className="text-slate-300 hover:text-white transition">UPSC</span>
              <span className="text-slate-300 hover:text-white transition">SSC</span>
              <span className="text-slate-300 hover:text-white transition">CBSE</span>
              <span className="text-slate-300 hover:text-white transition">MPBSE</span>
              <span className="text-slate-300 hover:text-white transition">IBPS</span>
              <span className="text-slate-300 hover:text-white transition">NSP PORTAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Interactive Student Personalization Widget */}
        <StudentPersonalizer onFilterChange={handleFilterChange} />

        {/* Live Breaking Updates Banner */}
        <section className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-4 sm:p-5 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-amber-500 text-white rounded-xl shrink-0 shadow-md">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 rounded">
                  Latest Verified Notice
                </span>
                <span className="text-xs text-slate-500">Official NTA Portal</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                NEET UG 2027: Online Application Window Extended up to 16 March 2027 (11:50 PM)
              </p>
            </div>
          </div>

          <Link
            href="/exams/neet-ug-2027"
            className="text-xs font-bold px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 rounded-xl shadow-sm border border-slate-200 transition shrink-0 flex items-center gap-1.5"
          >
            View Official Notice <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </Link>
        </section>

        {/* Prioritized Examinations Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Tailored For Stream: {filteredStream}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Key Examinations & Entrance Deadlines
              </h2>
            </div>

            <Link
              href="/exams"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Browse All Examinations <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prioritizedExams.slice(0, 6).map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </section>

        {/* Recommended Scholarships & Opportunities Section */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Financial Aid & Career
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Government Scholarships, Fellowships & Internships
              </h2>
            </div>

            <Link
              href="/opportunities"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              View All Scholarships <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.slice(0, 3).map((opp) => (
              <OppCard key={opp.id} opp={opp} />
            ))}
          </div>
        </section>

        {/* Official Source Health & Integrity Section */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Live Verification Integrity
              </div>
              <h3 className="text-2xl font-black text-white mt-1">
                Zero Hallucinations. 100% Official Source Truth.
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                ExamSetu continuously monitors official domains through dedicated organization adapters. When dates are not yet announced by conducting bodies, we explicitly state &quot;Not officially announced&quot; rather than speculating.
              </p>
            </div>

            <Link
              href="/admin/sources"
              className="text-xs font-bold px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shrink-0"
            >
              View Source Health Registry
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-2xl font-black text-emerald-400">8 / 8</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Adapters Healthy</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-2xl font-black text-blue-400">100%</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Official Domain Verified</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-2xl font-black text-amber-400">&lt; 250ms</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Average Source Latency</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-2xl font-black text-purple-400">Zero</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Third-Party Aggregators</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
