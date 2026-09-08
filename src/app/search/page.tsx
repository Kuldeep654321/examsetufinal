'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, BookOpen, Sparkles, Filter, X, ArrowRight, Award } from 'lucide-react';
import { ExamCard } from '@/components/exams/ExamCard';
import { OppCard } from '@/components/opportunities/OppCard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<'all' | 'exams' | 'opportunities'>('all');
  const [results, setResults] = useState<{
    exams: any[];
    opportunities: any[];
    categories: any[];
  }>({ exams: [], opportunities: [], categories: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ exams: [], opportunities: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults({
            exams: data.exams || [],
            opportunities: data.opportunities || [],
            categories: data.categories || [],
          });
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Global Intelligent Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Instant typo-tolerant search across examinations, board timetables, notifications, and scholarships
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NEET, JEE, MP Board 12th, UPSC, NSP Scholarships..."
            className="w-full text-sm sm:text-base pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-2 pt-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Results ({results.exams.length + results.opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'exams'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Examinations ({results.exams.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'opportunities'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Scholarships &amp; Jobs ({results.opportunities.length})
          </button>
        </div>
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Searching verified database...</div>
      ) : query && results.exams.length === 0 && results.opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No results found for &ldquo;{query}&rdquo;</h3>
          <p className="text-xs text-slate-500">
            Try searching with alternative keywords like &quot;NEET&quot;, &quot;CBSE&quot;, &quot;MPBSE&quot;, &quot;UPSC&quot;, &quot;Scholarship&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Exams Section */}
          {(activeTab === 'all' || activeTab === 'exams') && results.exams.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Matching Examinations ({results.exams.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </section>
          )}

          {/* Opportunities Section */}
          {(activeTab === 'all' || activeTab === 'opportunities') && results.opportunities.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Matching Opportunities ({results.opportunities.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.opportunities.map((opp) => (
                  <OppCard key={opp.id} opp={opp} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
