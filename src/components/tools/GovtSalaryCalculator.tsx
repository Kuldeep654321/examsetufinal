'use client';

import React, { useState } from 'react';
import {
  Banknote,
  Building2,
  HelpCircle,
  TrendingUp,
  Percent,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const PAY_LEVELS = [
  { level: 1, name: 'Pay Level 1 (Grade Pay ₹1,800)', minBasic: 18000, posts: 'Railway Group D, MTS, Attendant' },
  { level: 2, name: 'Pay Level 2 (Grade Pay ₹1,900)', minBasic: 19900, posts: 'Railway ALP, Junior Clerk, Accounts Clerk' },
  { level: 3, name: 'Pay Level 3 (Grade Pay ₹2,000)', minBasic: 21700, posts: 'SSC GD Constable, Security Guard, Junior Assistant' },
  { level: 4, name: 'Pay Level 4 (Grade Pay ₹2,400)', minBasic: 25500, posts: 'SSC CHSL DEO/LDC, UDC, Tax Assistant' },
  { level: 5, name: 'Pay Level 5 (Grade Pay ₹2,800)', minBasic: 29200, posts: 'Auditor, Accountant, Senior Clerk, Station Clerk' },
  { level: 6, name: 'Pay Level 6 (Grade Pay ₹4,200)', minBasic: 35400, posts: 'Junior Engineer (SSC JE), Sub-Inspector (SSC CPO), Station Master' },
  { level: 7, name: 'Pay Level 7 (Grade Pay ₹4,600)', minBasic: 44900, posts: 'Assistant Section Officer (ASO - MEA/CSS), GST Inspector, IT Inspector' },
  { level: 8, name: 'Pay Level 8 (Grade Pay ₹4,800)', minBasic: 47600, posts: 'Assistant Audit Officer (AAO - CAG), Section Officer' },
  { level: 9, name: 'Pay Level 9 (Grade Pay ₹5,400 PB-2)', minBasic: 53100, posts: 'Senior Section Officer, Assistant Director' },
  { level: 10, name: 'Pay Level 10 (Grade Pay ₹5,400 PB-3)', minBasic: 56100, posts: 'UPSC CSE (IAS/IPS/IFS Entry), ISRO Scientist \'SC\', DRDO Scientist B, NDA/CDS Officer (Lieutenant)' },
  { level: 11, name: 'Pay Level 11 (Grade Pay ₹6,600)', minBasic: 67700, posts: 'Under Secretary, Captain / Major, Senior Scientist' },
  { level: 12, name: 'Pay Level 12 (Grade Pay ₹7,600)', minBasic: 78800, posts: 'Deputy Secretary, Deputy Collector (Senior Scale), Lt Colonel' },
  { level: 13, name: 'Pay Level 13 (Grade Pay ₹8,700)', minBasic: 123100, posts: 'Director, District Magistrate (Selection Grade), Colonel' },
  { level: 14, name: 'Pay Level 14 (Grade Pay ₹10,000)', minBasic: 144200, posts: 'Joint Secretary to Govt of India, Inspector General of Police (IGP), Brigadier' },
];

export const CITY_TIERS = [
  { tier: 'X', hraPercent: 0.30, label: 'Class X (50 Lakh+ Population)', examples: 'Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Ahmedabad, Pune', taBase: 3600 },
  { tier: 'Y', hraPercent: 0.20, label: 'Class Y (5 Lakh to 50 Lakh Population)', examples: 'Indore, Bhopal, Jaipur, Lucknow, Patna, Chandigarh, Kochi, Nagpur, Surat', taBase: 1800 },
  { tier: 'Z', hraPercent: 0.10, label: 'Class Z (Remaining Cities & Rural Areas)', examples: 'All other small towns, rural districts, and border posts', taBase: 1800 },
];

export function GovtSalaryCalculator() {
  const [selectedLevel, setSelectedLevel] = useState<number>(7);
  const [selectedTier, setSelectedTier] = useState<string>('X');
  const [isNPS, setIsNPS] = useState<boolean>(true);

  const levelObj = PAY_LEVELS.find((l) => l.level === selectedLevel) || PAY_LEVELS[6];
  const tierObj = CITY_TIERS.find((t) => t.tier === selectedTier) || CITY_TIERS[0];

  const basicPay = levelObj.minBasic;
  const daPercent = 0.50; // Current 7th CPC DA @ 50%
  const dearnessAllowance = Math.round(basicPay * daPercent);
  const houseRentAllowance = Math.round(basicPay * tierObj.hraPercent);

  // Transport Allowance (TA) + DA on TA
  const baseTA = selectedLevel >= 9 ? (tierObj.tier === 'X' ? 7200 : 3600) : (tierObj.tier === 'X' ? 3600 : 1800);
  const daOnTA = Math.round(baseTA * daPercent);
  const transportAllowance = baseTA + daOnTA;

  // Gross Monthly Salary
  const grossMonthly = basicPay + dearnessAllowance + houseRentAllowance + transportAllowance;

  // Deductions
  const npsDeduction = isNPS ? Math.round((basicPay + dearnessAllowance) * 0.10) : 0;
  const cghsDeduction = selectedLevel >= 10 ? 1000 : selectedLevel >= 7 ? 650 : selectedLevel >= 4 ? 450 : 250;
  const professionalTax = 200; // Standard state average
  const totalDeductions = npsDeduction + cghsDeduction + professionalTax;

  // In-Hand Net Monthly Salary
  const netInHandMonthly = grossMonthly - totalDeductions;
  const annualCTC = grossMonthly * 12 + (isNPS ? Math.round((basicPay + dearnessAllowance) * 0.14) * 12 : 0); // Plus 14% Govt NPS Contribution

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Banknote className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              7th Pay Commission Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Government In-Hand Salary Calculator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accurate take-home calculation for Central Govt, SSC, UPSC, Railways, Banking & Defence positions with 50% DA and 2026 HRA rates.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
            Current DA: 50% • HRA: 30%/20%/10%
          </span>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pay Level Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select 7th CPC Pay Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(parseInt(e.target.value, 10))}
            className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            {PAY_LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                {l.name} (Basic: ₹{l.minBasic.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Example Posts: <strong>{levelObj.posts}</strong>
          </p>
        </div>

        {/* City Classification */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            City Tier / Posting Location
          </label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            {CITY_TIERS.map((t) => (
              <option key={t.tier} value={t.tier}>
                {t.label} (HRA: {t.hraPercent * 100}%)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {tierObj.examples}
          </p>
        </div>

        {/* NPS Subscription */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Pension Scheme (NPS)
          </label>
          <select
            value={isNPS ? 'yes' : 'no'}
            onChange={(e) => setIsNPS(e.target.value === 'yes')}
            className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="yes">National Pension System (10% Employee + 14% Govt)</option>
            <option value="no">Old Pension Scheme (OPS / No Deduction)</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Govt contributes 14% matching share to your PRAN
          </p>
        </div>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Left: Earnings Breakdown */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200 flex items-center justify-between">
            <span>Monthly Earnings</span>
            <span className="text-emerald-700 font-bold">+ Gross</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Basic Pay:</span>
              <span className="font-bold text-slate-900">₹{basicPay.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Dearness Allowance (DA @ 50%):</span>
              <span className="font-bold text-slate-900">₹{dearnessAllowance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">House Rent Allowance (HRA @ {tierObj.hraPercent * 100}%):</span>
              <span className="font-bold text-slate-900">₹{houseRentAllowance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Transport Allowance (TA + DA):</span>
              <span className="font-bold text-slate-900">₹{transportAllowance.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Gross Monthly Salary:</span>
              <span className="text-blue-700">₹{grossMonthly.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Center: Deductions */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200 flex items-center justify-between">
            <span>Mandatory Deductions</span>
            <span className="text-rose-700 font-bold">- Deductions</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">NPS Tier-1 (10% of Basic+DA):</span>
              <span className="font-bold text-rose-700">- ₹{npsDeduction.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Central Govt Health Scheme (CGHS):</span>
              <span className="font-bold text-rose-700">- ₹{cghsDeduction.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Professional Tax (PT):</span>
              <span className="font-bold text-rose-700">- ₹{professionalTax.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Total Monthly Deductions:</span>
              <span className="text-rose-700">₹{totalDeductions.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right: Net Take Home Highlight Card */}
        <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded-md backdrop-blur-sm">
              Estimated Take-Home Pay
            </span>
            <div className="mt-2">
              <p className="text-xs text-emerald-100 font-medium">Monthly In-Hand Salary:</p>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
                ₹{netInHandMonthly.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-emerald-200"> / month</span>
              </h3>
            </div>
          </div>

          <div className="pt-3 border-t border-white/20 text-xs space-y-1.5 text-emerald-100">
            <div className="flex items-center justify-between">
              <span>Approximate Annual CTC:</span>
              <strong className="text-white text-sm">₹{(annualCTC / 100000).toFixed(2)} Lakhs</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-200">
              <span>Govt NPS Contribution (14%):</span>
              <span>+ ₹{Math.round((basicPay + dearnessAllowance) * 0.14).toLocaleString('en-IN')}/mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
