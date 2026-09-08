'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Filter, Sparkles, CheckCircle2, ArrowRight, UserCheck, BookOpen, Compass } from 'lucide-react';

interface StudentPersonalizerProps {
  onFilterChange: (filters: {
    classLevel: string;
    board: string;
    state: string;
    stream: string;
    targetExam: string;
  }) => void;
}

export function StudentPersonalizer({ onFilterChange }: StudentPersonalizerProps) {
  const [classLevel, setClassLevel] = useState('12');
  const [board, setBoard] = useState('CBSE');
  const [state, setState] = useState('Madhya Pradesh');
  const [stream, setStream] = useState('PCB');
  const [targetExam, setTargetExam] = useState('NEET UG');

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange({ classLevel, board, state, stream, targetExam });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 -mt-10 relative z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Personalized Student Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Tailor Your Exam & Opportunity Radar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your academic profile to automatically prioritize relevant exam dates, admit cards, results, and scholarships.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setClassLevel('12');
              setStream('PCB');
              setState('Madhya Pradesh');
              setTargetExam('NEET UG');
              onFilterChange({ classLevel: '12', board: 'CBSE', state: 'Madhya Pradesh', stream: 'PCB', targetExam: 'NEET UG' });
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition"
          >
            Example: 12th PCB + NEET
          </button>
          <button
            type="button"
            onClick={() => {
              setClassLevel('12');
              setStream('PCM');
              setTargetExam('JEE Main');
              onFilterChange({ classLevel: '12', board: 'CBSE', state: 'Madhya Pradesh', stream: 'PCM', targetExam: 'JEE Main' });
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            12th PCM + JEE
          </button>
        </div>
      </div>

      {/* Selectors Grid */}
      <form onSubmit={handleApply} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6">
        {/* Class Level */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Class / Level
          </label>
          <select
            value={classLevel}
            onChange={(e) => {
              setClassLevel(e.target.value);
              onFilterChange({ classLevel: e.target.value, board, state, stream, targetExam });
            }}
            className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="10">Class 10th</option>
            <option value="12">Class 12th</option>
            <option value="Undergraduate">Undergraduate (College)</option>
            <option value="Graduate">Graduate / Degree</option>
          </select>
        </div>

        {/* Stream */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Stream
          </label>
          <select
            value={stream}
            onChange={(e) => {
              setStream(e.target.value);
              onFilterChange({ classLevel, board, state, stream: e.target.value, targetExam });
            }}
            className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="PCB">PCB (Medical / Life Sciences)</option>
            <option value="PCM">PCM (Engineering / Tech)</option>
            <option value="Commerce">Commerce / Finance</option>
            <option value="Arts/Humanities">Arts / Humanities</option>
            <option value="Any">General / Any Stream</option>
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            State / Region
          </label>
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              onFilterChange({ classLevel, board, state: e.target.value, stream, targetExam });
            }}
            className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Bihar">Bihar</option>
            <option value="All India">All India</option>
          </select>
        </div>

        {/* Board */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Board
          </label>
          <select
            value={board}
            onChange={(e) => {
              setBoard(e.target.value);
              onFilterChange({ classLevel, board: e.target.value, state, stream, targetExam });
            }}
            className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="CBSE">CBSE Board</option>
            <option value="MPBSE">MP Board (MPBSE)</option>
            <option value="ICSE">ICSE / ISC</option>
            <option value="State Board">Other State Board</option>
            <option value="NIOS">NIOS Open School</option>
          </select>
        </div>

        {/* Target Exam */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Focus
          </label>
          <select
            value={targetExam}
            onChange={(e) => {
              setTargetExam(e.target.value);
              onFilterChange({ classLevel, board, state, stream, targetExam: e.target.value });
            }}
            className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            <option value="NEET UG">NEET UG (Medical)</option>
            <option value="JEE Main">JEE Main (Engineering)</option>
            <option value="CUET UG">CUET UG (Universities)</option>
            <option value="UPSC CSE">UPSC CSE (Civil Services)</option>
            <option value="SSC CGL">SSC CGL (Govt Jobs)</option>
            <option value="MP Board 12th">MP Board 12th</option>
            <option value="CBSE Class 12">CBSE Class 12</option>
            <option value="Scholarships">Merit Scholarships</option>
          </select>
        </div>
      </form>
    </div>
  );
}
