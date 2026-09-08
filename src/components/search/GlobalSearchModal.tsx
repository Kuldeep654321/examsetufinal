'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, Sparkles, Building2, ExternalLink, ArrowRight, Clock } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    exams: any[];
    opportunities: any[];
    categories: any[];
  }>({ exams: [], opportunities: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ exams: [], opportunities: [], categories: [] });
    }
  }, [isOpen]);

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

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exams (e.g., NEET, MP Board 12th), scholarships, jobs..."
            className="w-full text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
          {loading && (
            <div className="py-8 text-center text-sm text-slate-500">
              <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching verified database...
            </div>
          )}

          {!loading && query && results.exams.length === 0 && results.opportunities.length === 0 && results.categories.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-600 font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for &quot;NEET&quot;, &quot;UPSC&quot;, &quot;Class 12&quot;, &quot;Scholarship&quot;</p>
            </div>
          )}

          {!query && (
            <div className="py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['NEET UG 2027', 'JEE Main 2027', 'CBSE Class 12', 'MP Board 12th', 'UPSC CSE', 'NSP Scholarship', 'SSC CGL', 'CUET UG'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-700 rounded-lg transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exams Results */}
          {results.exams.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-primary-600" /> Examinations ({results.exams.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {results.exams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/exams/${exam.slug}`}
                    onClick={onClose}
                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-primary-700">
                          {exam.title}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                          {exam.org_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{exam.category_name}</span> • <span>Level: {exam.level}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Results */}
          {results.opportunities.length > 0 && (
            <div className="pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" /> Opportunities & Scholarships ({results.opportunities.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {results.opportunities.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.slug}`}
                    onClick={onClose}
                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-primary-700">
                          {opp.title}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100 uppercase">
                          {opp.opp_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {opp.financial_aid_amount ? `Benefit: ${opp.financial_aid_amount}` : opp.qualification}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Official Intelligence Source: Verified Conducting Bodies</span>
          <Link href="/search" onClick={onClose} className="font-semibold text-primary-600 hover:text-primary-700 flex items-center">
            Advanced Filters <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
