'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, BookOpen, Layers, Sparkles, X, ChevronRight, Award } from 'lucide-react';
import { ExamCard } from '@/components/exams/ExamCard';
import { Exam } from '@/types';

const categoriesList = [
  { slug: 'all', name: 'All Categories' },
  { slug: 'medical-entrance', name: 'Medical Entrance (NEET)' },
  { slug: 'engineering-entrance', name: 'Engineering Entrance (JEE)' },
  { slug: 'school-boards', name: 'Class 10 & 12 Boards' },
  { slug: 'civil-services', name: 'Civil Services & UPSC' },
  { slug: 'staff-selection', name: 'Staff Selection (SSC)' },
  { slug: 'banking-insurance', name: 'Banking & Insurance' },
  { slug: 'university-entrance', name: 'University (CUET)' },
  { slug: 'law-entrance', name: 'Law (CLAT)' },
  { slug: 'management-entrance', name: 'Management (CAT)' },
  { slug: 'healthcare-recruitment', name: 'Healthcare Recruitment (NHM)' },
];

import { EligibilityCalculator } from '@/components/tools/EligibilityCalculator';

function ExamsDirectoryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStream, setSelectedStream] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedStream !== 'all') params.set('stream', selectedStream);
        if (selectedLevel !== 'all') params.set('level', selectedLevel);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        params.set('limit', '100');

        const res = await fetch(`/api/exams?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setExams(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchExams();
  }, [selectedCategory, selectedStream, selectedLevel, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Official Directory
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          All Indian Examinations &amp; Boards
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Verified schedules, syllabi, admit cards, and application deadlines across National, State, and Board examinations.
        </p>
      </div>

      {/* Eligibility Calculator Tool */}
      <EligibilityCalculator />

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exam name (e.g., NEET, MP Board 12th, SSC CGL, UPSC)..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categoriesList.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">All Streams</option>
              <option value="PCB">PCB (Medical)</option>
              <option value="PCM">PCM (Engineering)</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts/Humanities">Arts / Humanities</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Exam Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">All Levels</option>
              <option value="National">National Level</option>
              <option value="State">State Level</option>
            </select>
          </div>

          <div className="col-span-2 flex items-end justify-end">
            {(selectedCategory !== 'all' || selectedStream !== 'all' || selectedLevel !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStream('all');
                  setSelectedLevel('all');
                  setSearchQuery('');
                }}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 py-1.5"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Showing {exams.length} verified examinations</span>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching examinations found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query, stream, or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExamsDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading directory...</div>}>
      <ExamsDirectoryContent />
    </Suspense>
  );
}
