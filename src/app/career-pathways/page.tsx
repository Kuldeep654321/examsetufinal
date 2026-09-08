import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
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
  Scale
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Career Pathways & What After 10th/12th/Degree - ExamSetu',
  description: 'Comprehensive Indian student career roadmap mapping school boards, entrance exams, degree courses, and competitive government career pathways.',
};

export default function CareerPathwaysPage() {
  const pathways = [
    {
      title: 'After Class 10th (Secondary School)',
      icon: '🏫',
      color: 'blue',
      branches: [
        {
          name: '1. Science Stream (PCM)',
          careers: 'Engineering (B.Tech), Architecture (B.Arch), National Defence Academy (NDA), Commercial Pilot, Data Science',
          exams: ['JEE Main', 'JEE Advanced', 'BITSAT', 'NDA & NA', 'State CETs'],
        },
        {
          name: '2. Science Stream (PCB)',
          careers: 'Doctor (MBBS/BDS), AYUSH (BAMS/BHMS), Nursing, Pharmacy (B.Pharm), Biotechnology, Veterinary',
          exams: ['NEET UG', 'AIIMS B.Sc Nursing', 'ICAR AIEEA'],
        },
        {
          name: '3. Commerce Stream',
          careers: 'Chartered Accountant (CA), Company Secretary (CS), Investment Banking, Corporate Law, Business Management',
          exams: ['CUET UG (B.Com/BBA)', 'IPMAT (IIM Indore/Rohtak)', 'CLAT UG', 'CA Foundation'],
        },
        {
          name: '4. Arts / Humanities',
          careers: 'Civil Services (IAS/IPS), Judicial Services, Journalism, Public Policy, Graphic Design, International Relations',
          exams: ['CUET UG (BA Honours)', 'CLAT (5-Yr LLB)', 'NID DAT', 'NIFT'],
        },
        {
          name: '5. Polytechnic & Technical Diploma',
          careers: 'Junior Engineer, Technician, Lateral Entry to B.Tech 2nd Year, Railway ALP',
          exams: ['State Polytechnic Entrance Exams', 'ITI Admissions'],
        },
      ],
    },
    {
      title: 'After Class 12th Science (PCM / PCB)',
      icon: '🔬',
      color: 'indigo',
      branches: [
        {
          name: 'Engineering & Technology',
          careers: 'IITs, NITs, IIITs, BITS, Government Engineering Colleges',
          exams: ['JEE Main', 'JEE Advanced', 'BITSAT', 'MHT CET', 'WBJEE', 'KCET'],
        },
        {
          name: 'Medical & Healthcare',
          careers: 'AIIMS, Government Medical Colleges, AFMC Pune, State GMCs',
          exams: ['NEET UG', 'NEET MDS', 'AIIMS Nursing'],
        },
        {
          name: 'Armed Forces Officer Entry',
          careers: 'Commissioned Officer in Indian Army, Navy, Air Force (Lieutenant/Flying Officer)',
          exams: ['UPSC NDA & NA', 'Indian Navy 10+2 B.Tech Cadet Entry', 'Air Force Agniveer'],
        },
        {
          name: 'Pure & Applied Research',
          careers: 'IISc Bangalore, IISERs, NISER, Central Universities with ₹80,000/yr INSPIRE Scholarship',
          exams: ['IAT (IISER Aptitude Test)', 'NEST', 'CUET UG Science'],
        },
      ],
    },
    {
      title: 'After Graduation (Any Degree Holder)',
      icon: '🎓',
      color: 'emerald',
      branches: [
        {
          name: 'Apex Civil Services',
          careers: 'Indian Administrative Service (IAS), IPS, IFS, State Deputy Collector (SDM)',
          exams: ['UPSC CSE (Civil Services)', 'MPPSC SSE', 'UPPSC PCS', 'BPSC CCE', 'MPSC'],
        },
        {
          name: 'Central Government Ministries',
          careers: 'Income Tax Inspector, GST Inspector, Assistant Section Officer (MEA/CSS), CBI Sub-Inspector',
          exams: ['SSC CGL (14,582 Posts)', 'SSC CPO SI', 'SSC CHSL'],
        },
        {
          name: 'Banking & Financial Sector',
          careers: 'Probationary Officer (PO), RBI Grade B Officer, SBI PO, NABARD Grade A',
          exams: ['IBPS PO', 'SBI PO', 'RBI Grade B', 'IBPS RRB Officer'],
        },
        {
          name: 'Indian Railways & Public Sector',
          careers: 'Station Master, Goods Train Manager, Railway Junior Engineer',
          exams: ['RRB NTPC', 'RRB ALP', 'RRB JE'],
        },
        {
          name: 'Postgraduate Management & Law',
          careers: 'IIMs MBA, Corporate Legal Counsel, National Law Universities',
          exams: ['CAT', 'XAT', 'CLAT PG', 'GATE (M.Tech/PSUs)'],
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Career Pathways</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-md space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>Complete Student Career Roadmap 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          What After 10th, 12th & Graduation?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Navigate India&apos;s educational milestones with confidence. Explore stream selection, national entrance examinations, eligible scholarships, and career prospects at every stage of your academic journey.
        </p>
      </div>

      {/* Pathways Sections */}
      <div className="space-y-10">
        {pathways.map((section, sIdx) => (
          <div key={sIdx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <span className="text-3xl">{section.icon}</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {section.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive pathways and matching examinations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.branches.map((b, bIdx) => (
                <div
                  key={bIdx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 flex flex-col justify-between hover:border-blue-300 transition"
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 text-blue-950">
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Career Horizons:</strong> {b.careers}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                      Key Examinations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {b.exams.map((examName) => (
                        <span
                          key={examName}
                          className="px-2 py-0.5 bg-white text-slate-800 font-bold border border-slate-200 rounded text-[11px]"
                        >
                          {examName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
