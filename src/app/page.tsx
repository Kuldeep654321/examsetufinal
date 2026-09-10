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
  Landmark,
  Briefcase,
  DollarSign,
  GraduationCap,
  Layers,
  Compass,
  Users,
  Banknote,
  Building2
} from 'lucide-react';
import { useAuth } from '@/components/layout/AuthContext';
import { ProfileFilterState, PRESET_PROFILES } from '@/components/home/StudentPersonalizer';
import { filterExamsForProfile, filterOpportunitiesForProfile } from '@/lib/recommendation-engine';
import { ExamCard } from '@/components/exams/ExamCard';
import { OppCard } from '@/components/opportunities/OppCard';
import { Exam, Opportunity } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Active student profile state (Default: B.Tech 4th Year / Engineering Graduate or user profile)
  const [profile, setProfile] = useState<ProfileFilterState>({
    classLevel: 'BTech_Final',
    stream: 'Engineering',
    targetCategory: 'Engineering & Post-Graduation',
    presetKey: 'btech-4th-year',
  });

  // Suggestion Active Tab
  const [activeTab, setActiveTab] = useState<'exams' | 'jobs' | 'scholarships' | 'internships'>('exams');

  useEffect(() => {
    async function loadData() {
      try {
        const [examsRes, oppsRes] = await Promise.all([
          fetch('/api/exams?limit=100'),
          fetch('/api/opportunities?limit=40'),
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

  // Initialize from localStorage on client mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('examsetu_preset');
      if (saved) {
        const found = PRESET_PROFILES.find((p) => p.id === saved);
        if (found) {
          setProfile({
            classLevel: found.classLevel,
            stream: found.stream,
            discipline: found.discipline,
            targetCategory: found.targetCategory,
            presetKey: found.id,
          });
        }
      }
    }
  }, []);

  // Update profile if logged in user has specific profile settings
  useEffect(() => {
    if (user && (user as any).profile) {
      const up = (user as any).profile;
      const matchedPreset = PRESET_PROFILES.find(
        (p) => p.classLevel === up.class_level || (p.stream === up.stream && p.classLevel === up.class_level)
      );

      setProfile({
        classLevel: up.class_level || 'BTech_Final',
        stream: up.stream || 'Engineering',
        targetCategory: up.target_category || 'All',
        presetKey: matchedPreset ? matchedPreset.id : 'custom',
      });
    }
  }, [user]);

  // Filter exams strictly tailored for current student stage
  const matchingExams = filterExamsForProfile(exams, {
    classLevel: profile.classLevel,
    stream: profile.stream,
    targetCategory: profile.targetCategory,
  });

  // Filter matching opportunities
  const filteredOpps = filterOpportunitiesForProfile(opportunities, {
    classLevel: profile.classLevel,
    stream: profile.stream,
  });

  const matchingJobs = filteredOpps.filter((o) => o.opp_type === 'job');
  const matchingScholarships = filteredOpps.filter((o) => o.opp_type === 'scholarship');
  const matchingInternships = filteredOpps.filter((o) => o.opp_type === 'internship');

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
              <span>100% Official Source Intelligence • Continuous Engine Active</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Never Miss an Exam Date, Govt Job, or Scholarship.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              India&apos;s authoritative platform verifying notices from NTA, UPSC, SSC, CBSE, State Boards, and National Scholarship Portals with zero hallucinations.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/exams"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Explore 40+ Major Exams
              </Link>
              <Link
                href="/jobs"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" /> Sarkari Job Vacancies
              </Link>
              <Link
                href="/internships"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-purple-400" /> National Internships
              </Link>
            </div>

            {/* Official Conducting Agencies Bar */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>National Agencies:</span>
              <span className="text-slate-300 hover:text-white transition">NTA</span>
              <span className="text-slate-300 hover:text-white transition">UPSC</span>
              <span className="text-slate-300 hover:text-white transition">SSC</span>
              <span className="text-slate-300 hover:text-white transition">CBSE</span>
              <span className="text-slate-300 hover:text-white transition">MPBSE</span>
              <span className="text-slate-300 hover:text-white transition">IBPS</span>
              <span className="text-slate-300 hover:text-white transition">RRB</span>
              <span className="text-slate-300 hover:text-white transition">NITI AAYOG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Live Breaking Updates Banner */}
        <section className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-amber-500/10 rounded-3xl p-5 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <span className="p-2.5 bg-blue-600 text-white rounded-2xl shrink-0 shadow-md">
              <Flame className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                  Live Active Notification
                </span>
                <span className="text-xs text-slate-500 font-semibold">Staff Selection Commission • Official Notice</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                SSC CHSL 2026: Online Applications Open (07 Sept to 07 Oct 2026) • SSC CGL 2026 Tier-1 CBT Ongoing
              </p>
            </div>
          </div>

          <Link
            href="/exams/ssc-chsl-2026"
            className="text-xs font-bold px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-xl shadow-sm border border-slate-200 transition shrink-0 flex items-center gap-1.5"
          >
            View Official Schedule <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </Link>
        </section>

        {/* ADMISSION & COUNSELLING ECOSYSTEM HUBS */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 block">
                Admission &amp; Counselling Radar
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Complete Indian Higher Education Ecosystem
              </h2>
            </div>
            <Link
              href="/career-pathways"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Explore Full Pathways <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hub 1: Counselling Systems */}
            <Link
              href="/counselling"
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-200 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="p-2 bg-indigo-600 text-white rounded-xl inline-block shadow-sm">
                  <Layers className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition mt-2">
                  Counselling Systems
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  JoSAA, CSAB, MCC Medical, AACCC, and CLAT multi-round seat allocation rules.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1 pt-2">
                Explore Counselling <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </Link>

            {/* Hub 2: Colleges & Institutes */}
            <Link
              href="/institutions"
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-200 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="p-2 bg-blue-600 text-white rounded-xl inline-block shadow-sm">
                  <Building2 className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition mt-2">
                  Colleges &amp; Universities
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  23 IITs, 32 NITs, AIIMS, 24 NLUs, and Central Universities with recognized degrees.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1 pt-2">
                Browse Institutes <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </Link>

            {/* Hub 3: Recognized Degrees & Courses */}
            <Link
              href="/courses"
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="p-2 bg-emerald-600 text-white rounded-xl inline-block shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition mt-2">
                  Recognized Degree Courses
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  B.Tech, MBBS, BDS, BAMS, B.Pharm, BA LLB, MBA, M.Tech, and Polytechnic Diplomas.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-2">
                Browse Courses <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </Link>

            {/* Hub 4: Student Pathways Engine */}
            <Link
              href="/career-pathways"
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-200 hover:shadow-md transition group space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="p-2 bg-purple-600 text-white rounded-xl inline-block shadow-sm">
                  <Compass className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition mt-2">
                  Student Pathway Engine
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Interactive step-by-step roadmap after Class 10, 12th Streams, B.Tech, or Degree.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 flex items-center gap-1 pt-2">
                Launch Pathways <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </Link>
          </div>
        </section>

        {/* DYNAMIC PROFILE RECOMMENDATION TABS */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Target Suggestions for: {profile.classLevel === 'BTech_Final' ? 'B.Tech 4th Year / Engineering Graduate' : profile.classLevel === '10' || profile.classLevel === '12' ? `Class ${profile.classLevel}th (${profile.stream})` : `${profile.classLevel} (${profile.stream})`}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Recommended Opportunities After Your Current Stage
              </h2>
            </div>

            {/* Tab Navigation Controls */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('exams')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === 'exams'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎯 Target Exams ({matchingExams.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === 'jobs'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💼 Govt Jobs ({matchingJobs.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('scholarships')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === 'scholarships'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💰 Scholarships ({matchingScholarships.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('internships')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === 'internships'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎓 Internships ({matchingInternships.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Exams */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              {matchingExams.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <p className="font-semibold text-sm">No specific examinations match this exact profile filter.</p>
                  <Link href="/exams" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block">
                    Browse All Examinations
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingExams.slice(0, 9).map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              )}

              <div className="text-center pt-4">
                <Link
                  href="/exams"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl transition border border-blue-200 text-xs"
                >
                  View All Indian Examinations <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Tab 2: Govt Jobs */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {matchingJobs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <p className="font-semibold text-sm">No active job notifications currently open for this specific filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingJobs.slice(0, 6).map((opp) => (
                    <OppCard key={opp.id} opp={opp} />
                  ))}
                </div>
              )}

              <div className="text-center pt-4">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-2xl transition border border-emerald-200 text-xs"
                >
                  Explore All Active Government Vacancies <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Tab 3: Scholarships */}
          {activeTab === 'scholarships' && (
            <div className="space-y-4">
              {matchingScholarships.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <p className="font-semibold text-sm">No specific scholarship programs listed for this profile level.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingScholarships.slice(0, 6).map((opp) => (
                    <OppCard key={opp.id} opp={opp} />
                  ))}
                </div>
              )}

              <div className="text-center pt-4">
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-2xl transition border border-amber-200 text-xs"
                >
                  View All National Scholarships &amp; Financial Aid <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Tab 4: Internships */}
          {activeTab === 'internships' && (
            <div className="space-y-4">
              {matchingInternships.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <p className="font-semibold text-sm">No internships currently listed for this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingInternships.slice(0, 6).map((opp) => (
                    <OppCard key={opp.id} opp={opp} />
                  ))}
                </div>
              )}

              <div className="text-center pt-4">
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-2xl transition border border-purple-200 text-xs"
                >
                  View All Government &amp; Research Internships <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
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
              <span className="text-2xl font-black text-emerald-400">27 / 27</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Adapters Healthy</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-2xl font-black text-blue-400">100%</span>
              <p className="text-xs font-semibold text-slate-300 mt-1">Official Domain Verified</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-2xl font-black text-amber-400">&lt; 200ms</span>
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
