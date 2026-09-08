import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  BookOpen,
  Sparkles,
  Award,
  Lock,
  Heart,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Banknote,
  Flame,
  Compass
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
              ES
            </div>
            <div>
              <p className="font-bold text-white text-sm">ExamSetu (examsetu.in)</p>
              <p className="text-[11px] text-slate-400">
                Official Indian Examination, Sarkari Job & Opportunity Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Official Domain Extraction
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Lock className="w-4 h-4" /> Zero Speculation / Hallucination
            </span>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Col 1: National Entrance Exams */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Entrance Exams</h4>
          <ul className="space-y-2">
            <li><Link href="/exams/neet-ug-2027" className="hover:text-white transition">NEET UG (Medical)</Link></li>
            <li><Link href="/exams/jee-main-2027" className="hover:text-white transition">JEE Main (Engineering)</Link></li>
            <li><Link href="/exams/jee-advanced-2027" className="hover:text-white transition">JEE Advanced (IITs)</Link></li>
            <li><Link href="/exams/cuet-ug-2027" className="hover:text-white transition">CUET UG (Universities)</Link></li>
            <li><Link href="/exams/clat-ug-2027" className="hover:text-white transition">CLAT UG (Law)</Link></li>
            <li><Link href="/exams/cat-2027" className="hover:text-white transition">CAT (IIMs MBA)</Link></li>
            <li><Link href="/exams/gate-2027" className="hover:text-white transition">GATE 2027</Link></li>
          </ul>
        </div>

        {/* Col 2: Sarkari Jobs & Defence */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Govt Jobs & Defence</h4>
          <ul className="space-y-2">
            <li><Link href="/jobs" className="hover:text-white transition font-semibold text-emerald-400">All Govt Vacancies (Sarkari)</Link></li>
            <li><Link href="/exams/upsc-cse-2027" className="hover:text-white transition">UPSC CSE (IAS / IPS)</Link></li>
            <li><Link href="/exams/ssc-cgl-2027" className="hover:text-white transition">SSC CGL (14,582 Posts)</Link></li>
            <li><Link href="/exams/rrb-ntpc-2027" className="hover:text-white transition">RRB NTPC (Railways)</Link></li>
            <li><Link href="/exams/rrb-alp-2027" className="hover:text-white transition">RRB ALP (Loco Pilot)</Link></li>
            <li><Link href="/exams/ibps-po-2027" className="hover:text-white transition">IBPS Bank PO</Link></li>
            <li><Link href="/exams/upsc-nda-2027" className="hover:text-white transition">NDA & Naval Academy</Link></li>
          </ul>
        </div>

        {/* Col 3: Education & Counselling Ecosystem */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Admission & Colleges</h4>
          <ul className="space-y-2">
            <li><Link href="/counselling" className="hover:text-white transition font-semibold text-indigo-400">Counselling Systems (JoSAA/MCC)</Link></li>
            <li><Link href="/institutions" className="hover:text-white transition">IITs, NITs, AIIMS & NLUs</Link></li>
            <li><Link href="/courses" className="hover:text-white transition">UG / PG Degree Directory</Link></li>
            <li><Link href="/boards" className="hover:text-white transition">Class 10 & 12 School Boards</Link></li>
            <li><Link href="/career-pathways" className="hover:text-white transition text-blue-400 font-semibold">Student Pathways Engine</Link></li>
          </ul>
        </div>

        {/* Col 4: Internships & Scholarships */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Internships & Aid</h4>
          <ul className="space-y-2">
            <li><Link href="/internships" className="hover:text-white transition text-purple-400 font-semibold">Government Internships</Link></li>
            <li><Link href="/opportunities" className="hover:text-white transition">NSP National Scholarship</Link></li>
            <li><Link href="/opportunities" className="hover:text-white transition">INSPIRE SHE (₹80k/yr)</Link></li>
            <li><Link href="/tools/salary-calculator" className="hover:text-white transition">7th CPC Salary Calculator</Link></li>
            <li><Link href="/daily-gk" className="hover:text-white transition">Daily GK & Current Affairs</Link></li>
          </ul>
        </div>

        {/* Col 5: Platform & Verification */}
        <div className="space-y-3 col-span-2 md:col-span-1">
          <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Trust & Integrity</h4>
          <ul className="space-y-2">
            <li><Link href="/tools/data-quality" className="hover:text-white transition font-semibold text-emerald-400">Data Quality & Audit</Link></li>
            <li><Link href="/admin/sources" className="hover:text-white transition">Official Sources Registry</Link></li>
            <li><Link href="/admin/review-queue" className="hover:text-white transition">Verifier Review Queue</Link></li>
            <li><Link href="/dashboard/profile" className="hover:text-white transition">Notification Settings</Link></li>
            <li><a href="https://github.com/Kuldeep654321/examsetufinal" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">GitHub Repo <ExternalLink className="w-3 h-3" /></a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} ExamSetu (examsetu.in). Dedicated to Indian Aspirants.</p>
          <p className="text-slate-500">
            Official Data Sourced directly from NTA, UPSC, SSC, CBSE, State Boards, and National Portals.
          </p>
        </div>
      </div>
    </footer>
  );
}
