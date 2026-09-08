'use client';

import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Briefcase,
  GraduationCap,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Building2,
  Clock,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import Link from 'next/link';

export interface ProfileFilterState {
  classLevel: string;
  stream: string;
  targetCategory: string;
  presetKey?: string;
}

interface StudentPersonalizerProps {
  onProfileChange: (profile: ProfileFilterState) => void;
  activeProfile: ProfileFilterState;
}

export const PRESET_PROFILES = [
  {
    id: '12-pcm',
    label: '🧪 12th PCM (Engineering/Tech)',
    classLevel: '12',
    stream: 'PCM',
    targetCategory: 'Engineering Entrance',
    description: 'JEE Main, JEE Advanced, BITSAT, NDA, Technical Apprenticeships & Engineering Vacancies',
  },
  {
    id: '12-pcb',
    label: '🧬 12th PCB (Medical/Bio)',
    classLevel: '12',
    stream: 'PCB',
    targetCategory: 'Medical Entrance',
    description: 'NEET UG, AIIMS B.Sc Nursing, GPAT, INSPIRE SHE, PMSS & Medical Internships',
  },
  {
    id: '12-commerce',
    label: '📈 12th Commerce',
    classLevel: '12',
    stream: 'Commerce',
    targetCategory: 'Banking & Financial Sector',
    description: 'CUET UG, CLAT Law, CA Foundation, Central Sector Scholarship & Banking Exams',
  },
  {
    id: '12-arts',
    label: '🎨 12th Arts / Humanities',
    classLevel: '12',
    stream: 'Arts/Humanities',
    targetCategory: 'Civil Services & State PSCs',
    description: 'CUET UG (BA), CLAT, NID DAT, NIFT, Central Sector Scholarship & UPSC Foundation',
  },
  {
    id: 'engineering-grad',
    label: '⚙️ B.Tech / Engg Graduate',
    classLevel: 'Graduate',
    stream: 'PCM',
    targetCategory: 'Engineering Entrance',
    description: 'GATE, ISRO Scientist \'SC\', DRDO Scientist, SSC JE, RRB ALP, GSoC & RBI Internship',
  },
  {
    id: 'any-grad-upsc',
    label: '🎓 Any Graduate (Govt Jobs & UPSC)',
    classLevel: 'Graduate',
    stream: 'Any',
    targetCategory: 'Civil Services & State PSCs',
    description: 'UPSC CSE (IAS/IPS), SSC CGL (14,582 Posts), IBPS PO, RRB NTPC, State PSCs & NITI Aayog',
  },
  {
    id: 'banking-aspirant',
    label: '🏦 Banking & Finance Aspirant',
    classLevel: 'Graduate',
    stream: 'Any',
    targetCategory: 'Banking & Financial Sector',
    description: 'IBPS PO/Clerk, SBI PO (2,000 Posts), RBI Grade B, NABARD, SEBI & RBI Summer Internship',
  },
  {
    id: 'defence-aspirant',
    label: '🛡️ Defence & Uniform Aspirant',
    classLevel: '12',
    stream: 'Any',
    targetCategory: 'Defence & Paramilitary',
    description: 'UPSC NDA, CDS, AFCAT, CAPF AC, SSC GD Constable (39,481 Posts) & Agniveer',
  },
  {
    id: '10th-matric',
    label: '🏫 Class 10th / High School',
    classLevel: '10',
    stream: 'Any',
    targetCategory: 'Class 10 & 12 School Boards',
    description: 'CBSE Class 10, MP Board 10th, Polytechnic Diplomas, NTSE & Merit Scholarships',
  },
];

export function StudentPersonalizer({ onProfileChange, activeProfile }: StudentPersonalizerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(activeProfile.presetKey || '12-pcb');
  const [classLevel, setClassLevel] = useState(activeProfile.classLevel);
  const [stream, setStream] = useState(activeProfile.stream);

  const handleSelectPreset = (preset: typeof PRESET_PROFILES[0]) => {
    setSelectedPreset(preset.id);
    setClassLevel(preset.classLevel);
    setStream(preset.stream);
    onProfileChange({
      classLevel: preset.classLevel,
      stream: preset.stream,
      targetCategory: preset.targetCategory,
      presetKey: preset.id,
    });
  };

  const handleCustomChange = (newLevel: string, newStream: string) => {
    setClassLevel(newLevel);
    setStream(newStream);
    setSelectedPreset('custom');
    onProfileChange({
      classLevel: newLevel,
      stream: newStream,
      targetCategory: 'All',
      presetKey: 'custom',
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 -mt-10 relative z-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700">
              Personalized Career & Exam Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1.5">
            Choose Your Profile for Tailored Suggestions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Select your academic stream to automatically curate matching entrance exams, live government job vacancies (Sarkari Naukri), national scholarships, and government research internships.
          </p>
        </div>

        {/* Quick Active Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 shrink-0 self-start lg:self-center">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
          <span>Active Profile: <strong>{stream} • {classLevel === '10' || classLevel === '12' ? `Class ${classLevel}th` : classLevel}</strong></span>
        </div>
      </div>

      {/* Profile Preset Switcher Chips */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          Quick Preset Profiles (1-Click Switch)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROFILES.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{p.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Custom Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Education / Class Level
          </label>
          <select
            value={classLevel}
            onChange={(e) => handleCustomChange(e.target.value, stream)}
            className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="10">Class 10th (Secondary)</option>
            <option value="12">Class 12th (Higher Secondary)</option>
            <option value="Undergraduate">Undergraduate Student (UG)</option>
            <option value="Graduate">Graduate / Degree Holder</option>
            <option value="Postgraduate">Postgraduate / Master&apos;s</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Academic Stream
          </label>
          <select
            value={stream}
            onChange={(e) => handleCustomChange(classLevel, e.target.value)}
            className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="PCB">PCB (Physics, Chemistry, Biology - Medical)</option>
            <option value="PCM">PCM (Physics, Chemistry, Maths - Engineering)</option>
            <option value="Commerce">Commerce / Accountancy / Finance</option>
            <option value="Arts/Humanities">Arts / Humanities / Social Sciences</option>
            <option value="Any">General / Any Graduate Discipline</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Target Domain
          </label>
          <div className="text-xs font-semibold py-2.5 px-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-700 truncate">
            {PRESET_PROFILES.find((p) => p.id === selectedPreset)?.targetCategory || 'All Competitive Exams'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Quick Action
          </label>
          <Link
            href="/search"
            className="w-full text-xs font-black py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            Open Advanced Radar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
