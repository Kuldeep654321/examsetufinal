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
  discipline?: string;
}

interface StudentPersonalizerProps {
  onProfileChange: (profile: ProfileFilterState) => void;
  activeProfile: ProfileFilterState;
}

export const PRESET_PROFILES = [
  {
    id: 'btech-4th-year',
    label: '⚙️ B.Tech (4th / Final Year) & Graduate',
    classLevel: 'BTech_Final',
    stream: 'Engineering',
    discipline: 'B.Tech / B.E.',
    targetCategory: 'Engineering & Post-Graduation',
    description: 'GATE 2027 (IIT M.Tech & PSUs: IOCL, ONGC, NTPC), CAT 2027 (IIM MBA), SSC JE 2026, SSC CGL 2026, UPSC CSE, IBPS PO, UPSC CDS & NITI Aayog Internship',
  },
  {
    id: 'any-grad-upsc',
    label: '🎓 Any Graduate (Govt Jobs & UPSC)',
    classLevel: 'Graduate',
    stream: 'Any',
    discipline: 'Degree Holder',
    targetCategory: 'Civil Services & Banking',
    description: 'UPSC Civil Services (IAS/IPS), SSC CGL, IBPS PO XVI, CAT 2027, MPPSC State Services, UPSC CDS & NITI Aayog Internship',
  },
  {
    id: '12-pcm',
    label: '🧪 12th PCM (Engineering/Tech)',
    classLevel: '12',
    stream: 'PCM',
    discipline: 'Senior Secondary',
    targetCategory: 'Engineering Entrance',
    description: 'JEE Main 2027, JEE Advanced, UPSC NDA (II) 2026, CUET UG 2027, CBSE/MP Board Class 12, SSC CHSL & INSPIRE SHE',
  },
  {
    id: '12-pcb',
    label: '🧬 12th PCB (Medical/Bio)',
    classLevel: '12',
    stream: 'PCB',
    discipline: 'Senior Secondary',
    targetCategory: 'Medical Entrance',
    description: 'NEET UG 2027, MCC NEET Counselling, AACCC AYUSH Counselling, CBSE/MP Board Class 12, PM-USP Central Sector Scholarship',
  },
  {
    id: '12-commerce',
    label: '📈 12th Commerce',
    classLevel: '12',
    stream: 'Commerce',
    discipline: 'Senior Secondary',
    targetCategory: 'Commerce & Law',
    description: 'CUET UG 2027, CLAT UG 2027 (NLUs), CBSE/MP Board Class 12, SSC CHSL (10+2) & Central Sector Scholarship',
  },
  {
    id: '12-arts',
    label: '🎨 12th Arts / Humanities',
    classLevel: '12',
    stream: 'Arts/Humanities',
    discipline: 'Senior Secondary',
    targetCategory: 'Humanities & Law',
    description: 'CLAT UG 2027 (NLUs), CUET UG (BA Hons DU/BHU), CBSE/MP Board Class 12, SSC CHSL & Civil Services Foundation',
  },
  {
    id: 'polytechnic-diploma',
    label: '🔧 3-Year Polytechnic Diploma',
    classLevel: 'Polytechnic',
    stream: 'Engineering',
    discipline: 'Diploma in Engg',
    targetCategory: 'Lateral Entry & Junior Engineer',
    description: 'B.Tech Lateral Entry (Direct 2nd Year), SSC JE 2026 (Junior Engineer), RRB JE & Technical PSU Jobs',
  },
  {
    id: '10th-matric',
    label: '🏫 Class 10th / Secondary School',
    classLevel: '10',
    stream: 'Any',
    discipline: 'High School',
    targetCategory: 'Class 10 School Boards',
    description: 'CBSE Class 10 (2027), MP Board 10th (2027), 3-Yr Polytechnic Diplomas, ITI Trades & Senior Secondary Streams',
  },
];

export function StudentPersonalizer({ onProfileChange, activeProfile }: StudentPersonalizerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('examsetu_preset');
      if (saved && PRESET_PROFILES.some((p) => p.id === saved)) return saved;
    }
    return activeProfile.presetKey || 'btech-4th-year';
  });
  const [classLevel, setClassLevel] = useState(activeProfile.classLevel);
  const [stream, setStream] = useState(activeProfile.stream);

  const handleSelectPreset = (preset: typeof PRESET_PROFILES[0]) => {
    setSelectedPreset(preset.id);
    setClassLevel(preset.classLevel);
    setStream(preset.stream);
    if (typeof window !== 'undefined') {
      localStorage.setItem('examsetu_preset', preset.id);
    }
    onProfileChange({
      classLevel: preset.classLevel,
      stream: preset.stream,
      discipline: preset.discipline,
      targetCategory: preset.targetCategory,
      presetKey: preset.id,
    });
  };

  const handleCustomChange = (newLevel: string, newStream: string) => {
    setClassLevel(newLevel);
    setStream(newStream);
    setSelectedPreset('custom');
    if (typeof window !== 'undefined') {
      localStorage.setItem('examsetu_preset', 'custom');
    }
    onProfileChange({
      classLevel: newLevel,
      stream: newStream,
      targetCategory: 'All',
      presetKey: 'custom',
    });
  };

  const activePresetObj = PRESET_PROFILES.find((p) => p.id === selectedPreset);

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
              Personalized Student Career &amp; Exam Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1.5">
            Select Your Current Academic Level for Exact Next-Step Suggestions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            ExamSetu automatically customizes your homepage to show only the entrance exams, government recruitments (Sarkari Naukri), national scholarships, and internships you are eligible for <strong>after your current stage</strong>.
          </p>
        </div>

        {/* Quick Active Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 shrink-0 self-start lg:self-center shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
          <span>Active Context: <strong>{activePresetObj ? activePresetObj.label.split(' ')[1] + ' ' + (activePresetObj.label.split(' ')[2] || '') : stream}</strong></span>
        </div>
      </div>

      {/* Profile Preset Switcher Chips */}
      <div className="space-y-2.5">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          Quick Switch Academic Profile (1-Click Personalized Radar)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROFILES.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{p.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Active Intelligence Context Note */}
      {activePresetObj && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Targeting Roadmap for {activePresetObj.label}:</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {activePresetObj.description}
          </p>
        </div>
      )}

      {/* Granular Custom Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Education / Academic Level
          </label>
          <select
            value={classLevel}
            onChange={(e) => handleCustomChange(e.target.value, stream)}
            className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="BTech_Final">B.Tech (4th Year / Final Year)</option>
            <option value="Graduate">Graduate (Any Bachelor&apos;s Degree)</option>
            <option value="12">Class 12th (Senior Secondary)</option>
            <option value="Polytechnic">3-Year Polytechnic Diploma</option>
            <option value="10">Class 10th (Secondary School)</option>
            <option value="Postgraduate">Postgraduate / Master&apos;s</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Academic Stream / Discipline
          </label>
          <select
            value={stream}
            onChange={(e) => handleCustomChange(classLevel, e.target.value)}
            className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="Engineering">Engineering / Technology (B.Tech / B.E.)</option>
            <option value="PCM">PCM (Physics, Chemistry, Maths)</option>
            <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
            <option value="Commerce">Commerce / Accountancy / Finance</option>
            <option value="Arts/Humanities">Arts / Humanities / Social Sciences</option>
            <option value="Any">General / Any Bachelor&apos;s Degree</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Target Focus Area
          </label>
          <div className="text-xs font-semibold py-2.5 px-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-700 truncate">
            {activePresetObj?.targetCategory || 'All Next-Stage Opportunities'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Explore Full Roadmap
          </label>
          <Link
            href="/career-pathways"
            className="w-full text-xs font-black py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            Open Pathway Engine <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
