import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Banknote, ShieldCheck, Building2, HelpCircle } from 'lucide-react';
import { GovtSalaryCalculator } from '@/components/tools/GovtSalaryCalculator';

export const metadata: Metadata = {
  title: '7th Pay Commission Govt Salary & In-Hand Calculator 2026 - ExamSetu',
  description: 'Calculate exact in-hand salary, gross pay, DA (50%), HRA, and deductions for Central Government, SSC CGL, UPSC IAS, Railways, and Bank PO posts.',
};

export default function SalaryCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Govt Salary Calculator</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-md space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <Banknote className="w-4 h-4 text-emerald-400" />
          <span>7th Central Pay Commission (7th CPC) Standard</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Sarkari In-Hand Salary & Pay Matrix Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Wondering how much an IAS Officer, Income Tax Inspector, Station Master, or Probationary Officer takes home? Calculate exact monthly salaries including 50% Dearness Allowance (DA), revised House Rent Allowance (HRA), Transport Allowance (TA), and NPS deductions.
        </p>
      </div>

      {/* Calculator Interactive Widget */}
      <GovtSalaryCalculator />

      {/* Educational Guide on 7th CPC Structure */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900">
          Understanding Government Salary Components (7th CPC)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">1. Basic Pay & Pay Matrix Level</h4>
            <p>
              The basic pay starts from Level 1 (₹18,000 for Group D/MTS) up to Level 10 (₹56,100 for UPSC IAS/IPS & Group A Officers) and Level 14 (₹1,44,200 for Joint Secretaries). Central Government employees receive an annual 3% increment on July 1st or January 1st.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Dearness Allowance (DA)</h4>
            <p>
              DA is revised twice every year (in January and July) to offset inflation based on the All-India Consumer Price Index (AICPI-IW). When DA crosses 50%, HRA and allowances like Children Education Allowance automatically undergo upward revisions.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">3. House Rent Allowance (HRA) Classification</h4>
            <p>
              Cities are categorized into three tiers based on population density:
              <br />• <strong>Class X (30% HRA)</strong>: 50+ Lakhs (Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad).
              <br />• <strong>Class Y (20% HRA)</strong>: 5 to 50 Lakhs (Indore, Bhopal, Jaipur, Lucknow, Patna, Chandigarh).
              <br />• <strong>Class Z (10% HRA)</strong>: Remaining rural areas and small towns.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">4. National Pension System (NPS)</h4>
            <p>
              Under NPS Tier-I, 10% of (Basic Pay + DA) is deducted from the employee&apos;s monthly salary, while the Government contributes a matching <strong>14%</strong> directly into the employee&apos;s Permanent Retirement Account Number (PRAN).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
