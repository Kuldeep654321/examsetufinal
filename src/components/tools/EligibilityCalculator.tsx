'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, UserCheck, Calendar, Award } from 'lucide-react';

interface ExamEligibilityRule {
  slug: string;
  title: string;
  minAge?: number;
  maxAge?: number;
  minPercentage: number;
  requiredStreams: string[];
  categoryRelaxationPercentage: Record<string, number>;
  categoryRelaxationAge: Record<string, number>;
}

const EXAM_RULES: ExamEligibilityRule[] = [
  {
    slug: 'neet-ug-2027',
    title: 'NEET UG 2027 (Medical MBBS/BDS)',
    minAge: 17,
    maxAge: undefined,
    minPercentage: 50,
    requiredStreams: ['PCB'],
    categoryRelaxationPercentage: { 'OBC-NCL': 40, 'SC': 40, 'ST': 40, 'PwD': 45 },
    categoryRelaxationAge: {},
  },
  {
    slug: 'jee-main-2027',
    title: 'JEE Main 2027 (Engineering B.Tech)',
    minAge: undefined,
    maxAge: undefined,
    minPercentage: 75,
    requiredStreams: ['PCM'],
    categoryRelaxationPercentage: { 'SC': 65, 'ST': 65 },
    categoryRelaxationAge: {},
  },
  {
    slug: 'upsc-cse-2027',
    title: 'UPSC Civil Services Exam (IAS/IPS)',
    minAge: 21,
    maxAge: 32,
    minPercentage: 35, // Any pass in degree
    requiredStreams: ['Any', 'PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
    categoryRelaxationPercentage: {},
    categoryRelaxationAge: { 'OBC-NCL': 35, 'SC': 37, 'ST': 37, 'PwD': 42 },
  },
  {
    slug: 'mppsc-state-services-2027',
    title: 'MPPSC State Services 2027 (MP Govt)',
    minAge: 21,
    maxAge: 40,
    minPercentage: 35,
    requiredStreams: ['Any', 'PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
    categoryRelaxationPercentage: {},
    categoryRelaxationAge: { 'OBC-NCL': 45, 'SC': 45, 'ST': 45, 'Women': 45 },
  },
  {
    slug: 'clat-ug-2027',
    title: 'CLAT 2027 (Law 5-Yr Integrated LL.B)',
    minAge: undefined,
    maxAge: undefined,
    minPercentage: 45,
    requiredStreams: ['Any', 'PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
    categoryRelaxationPercentage: { 'SC': 40, 'ST': 40 },
    categoryRelaxationAge: {},
  },
  {
    slug: 'ssc-cgl-2027',
    title: 'SSC CGL 2027 (Graduation Level)',
    minAge: 18,
    maxAge: 32,
    minPercentage: 35,
    requiredStreams: ['Any', 'PCM', 'PCB', 'Commerce', 'Arts/Humanities'],
    categoryRelaxationPercentage: {},
    categoryRelaxationAge: { 'OBC-NCL': 35, 'SC': 37, 'ST': 37 },
  },
];

export function EligibilityCalculator() {
  const [dob, setDob] = useState('2008-05-15');
  const [percentage, setPercentage] = useState('78');
  const [stream, setStream] = useState('PCB');
  const [category, setCategory] = useState('General');
  const [showResults, setShowResults] = useState(false);

  const calculateAge = (dobString: string): number => {
    const birthDate = new Date(dobString);
    const targetDate = new Date('2027-12-31'); // Target admission year end
    let age = targetDate.getFullYear() - birthDate.getFullYear();
    const m = targetDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(dob);
  const parsedPercentage = parseFloat(percentage) || 0;

  const results = EXAM_RULES.map((rule) => {
    const reasons: string[] = [];
    let isEligible = true;

    // Stream check
    const streamMatches = rule.requiredStreams.includes('Any') || rule.requiredStreams.includes(stream);
    if (!streamMatches) {
      isEligible = false;
      reasons.push(`Requires stream: ${rule.requiredStreams.join(' or ')} (You selected ${stream})`);
    }

    // Percentage check
    const requiredPercentage = rule.categoryRelaxationPercentage[category] ?? rule.minPercentage;
    if (parsedPercentage < requiredPercentage) {
      isEligible = false;
      reasons.push(`Minimum ${requiredPercentage}% aggregate required in 12th/qualifying (Your score: ${parsedPercentage}%)`);
    }

    // Age check
    const effectiveMaxAge = rule.categoryRelaxationAge[category] ?? rule.maxAge;
    if (rule.minAge && currentAge < rule.minAge) {
      isEligible = false;
      reasons.push(`Must be at least ${rule.minAge} years old on 31 Dec 2027 (Current age: ${currentAge})`);
    }
    if (effectiveMaxAge && currentAge > effectiveMaxAge) {
      isEligible = false;
      reasons.push(`Maximum age limit is ${effectiveMaxAge} for ${category} category (Current age: ${currentAge})`);
    }

    return {
      rule,
      isEligible,
      reasons,
    };
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center space-x-2">
        <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
          <UserCheck className="w-5 h-5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Automated Verification Engine
        </span>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Instant Eligibility &amp; Age Relaxation Matcher
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Calculate your exact age on official cutoff dates and match against eligibility criteria for NEET, JEE, UPSC, and State PSCs.
        </p>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Age on 31 Dec 2027: <strong>{currentAge} yrs</strong></span>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Aggregate % in 12th / Degree</label>
          <input
            type="number"
            min="30"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Stream</label>
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
          >
            <option value="PCB">PCB (Medical)</option>
            <option value="PCM">PCM (Engineering)</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts/Humanities">Arts / Humanities</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Reservation Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
          >
            <option value="General">General / Open</option>
            <option value="OBC-NCL">OBC-NCL</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="PwD">PwD / PwBD</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider text-xs">
          Eligibility Results for Your Profile:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(({ rule, isEligible, reasons }) => (
            <div
              key={rule.slug}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                isEligible
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isEligible
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {isEligible ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                    {isEligible ? 'Eligible to Apply' : 'Ineligible'}
                  </span>
                </div>

                <Link href={`/exams/${rule.slug}`}>
                  <h4 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition">
                    {rule.title}
                  </h4>
                </Link>

                {!isEligible && reasons.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-red-700">
                    {reasons.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-end mt-3">
                <Link
                  href={`/exams/${rule.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Details &amp; Syllabus <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
