import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, CheckCircle2, Lock, FileText, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      {/* Trust & Transparency Banner */}
      <div className="border-b border-slate-900 py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm">100% Official Source Truth</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                We never scrape spam blogs or unverified aggregators. Every single date, pattern, and notification links directly to official conducting bodies.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shrink-0 border border-blue-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm">Human Verified Verification</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automated change-detection flags date extensions and admit cards in real time. Our verification team reviews before final publishing.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 shrink-0 border border-purple-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm">Zero Clickbait & Pure Privacy</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                No fake urgency, no popup ads, and no selling of student data. Your application tracking numbers and notes remain strictly private.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              ES
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              Exam<span className="text-blue-500">Setu</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            India&apos;s authoritative Exam & Opportunity Intelligence Platform. Real-time updates for CBSE, State Boards, NEET, JEE, UPSC, SSC, Banking, and verified Government Scholarships.
          </p>
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Official Production Domain</span>
            <p className="text-sm font-semibold text-blue-400">examsetu.in</p>
          </div>
        </div>

        {/* Column 1: School & Boards */}
        <div>
          <p className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Boards & School</p>
          <ul className="space-y-2 text-xs">
            <li><Link href="/exams/cbse-class-12-board-2027" className="hover:text-blue-400 transition">CBSE Class 12 Boards</Link></li>
            <li><Link href="/exams/cbse-class-10-board-2027" className="hover:text-blue-400 transition">CBSE Class 10 Boards</Link></li>
            <li><Link href="/exams/mp-board-12th-hssc-2027" className="hover:text-blue-400 transition">MP Board 12th (MPBSE)</Link></li>
            <li><Link href="/exams?category=school-boards" className="hover:text-blue-400 transition">All State Boards</Link></li>
          </ul>
        </div>

        {/* Column 2: Entrance Exams */}
        <div>
          <p className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">National Entrance</p>
          <ul className="space-y-2 text-xs">
            <li><Link href="/exams/neet-ug-2027" className="hover:text-blue-400 transition">NEET UG 2027</Link></li>
            <li><Link href="/exams/jee-main-2027" className="hover:text-blue-400 transition">JEE Main 2027</Link></li>
            <li><Link href="/exams/cuet-ug-2027" className="hover:text-blue-400 transition">CUET UG 2027</Link></li>
            <li><Link href="/exams/clat-ug-2027" className="hover:text-blue-400 transition">CLAT 2027 Law</Link></li>
            <li><Link href="/exams/cat-2027" className="hover:text-blue-400 transition">CAT 2027 IIM</Link></li>
          </ul>
        </div>

        {/* Column 3: Govt & Scholarships */}
        <div>
          <p className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Govt & Opportunities</p>
          <ul className="space-y-2 text-xs">
            <li><Link href="/exams/upsc-cse-2027" className="hover:text-blue-400 transition">UPSC CSE (IAS/IPS)</Link></li>
            <li><Link href="/exams/ssc-cgl-2027" className="hover:text-blue-400 transition">SSC CGL 2027</Link></li>
            <li><Link href="/exams/mppsc-state-services-2027" className="hover:text-blue-400 transition">MPPSC SSE 2027</Link></li>
            <li><Link href="/opportunities" className="hover:text-blue-400 transition">NSP Central Scholarship</Link></li>
            <li><Link href="/opportunities/inspire-she-scholarship-dst-2027" className="hover:text-blue-400 transition">INSPIRE Scholarship</Link></li>
          </ul>
        </div>
      </div>

      {/* Official Government Disclaimer */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 px-4">
        <p className="max-w-4xl mx-auto leading-relaxed">
          <strong>Disclaimer:</strong> ExamSetu (examsetu.in) is an independent informational and intelligence platform for Indian students. We aggregate publicly accessible notices from official government and conducting agency domains (such as nta.ac.in, upsc.gov.in, ssc.gov.in, cbse.gov.in, mpbse.nic.in). Students are always advised to refer to the linked official source before taking critical decisions.
        </p>
        <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-slate-600">
          Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for students across India • © {new Date().getFullYear()} ExamSetu
        </p>
      </div>
    </footer>
  );
}
