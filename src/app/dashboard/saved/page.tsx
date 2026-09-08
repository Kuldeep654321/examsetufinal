'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import { Bookmark, Trash2, ArrowRight, BookOpen, Sparkles, ExternalLink } from 'lucide-react';

export default function SavedItemsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [savedExams, setSavedExams] = useState<any[]>([]);
  const [savedOpps, setSavedOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setSavedExams(data.data?.savedExams || []);
        setSavedOpps(data.data?.savedOpportunities || []);
      }
    } catch (err) {
      console.error('Saved fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchSaved();
    }
  }, [user, authLoading, router]);

  const handleRemoveExam = async (examId: string) => {
    try {
      const res = await fetch(`/api/tracker/saved?type=exam&id=${examId}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedExams((prev) => prev.filter((e) => e.exam_id !== examId));
      }
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  const handleRemoveOpp = async (oppId: string) => {
    try {
      const res = await fetch(`/api/tracker/saved?type=opportunity&id=${oppId}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedOpps((prev) => prev.filter((o) => o.opp_id !== oppId));
      }
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <Bookmark className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Bookmarked Items
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Saved Examinations &amp; Opportunities
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quickly access your pinned exams and scholarship deadlines
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading saved items...</div>
      ) : (
        <div className="space-y-8">
          {/* Saved Exams Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Pinned Examinations ({savedExams.length})
            </h2>

            {savedExams.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No examinations pinned yet. Click &quot;Save&quot; on any exam detail page.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedExams.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                          {item.org_name}
                        </span>
                        <button
                          onClick={() => handleRemoveExam(item.exam_id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                          title="Unpin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Link href={`/exams/${item.slug}`}>
                        <h4 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition">
                          {item.title}
                        </h4>
                      </Link>
                      {item.notes && (
                        <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end mt-4">
                      <Link
                        href={`/exams/${item.slug}`}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Full Schedule <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved Opportunities Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Pinned Scholarships &amp; Fellowships ({savedOpps.length})
            </h2>

            {savedOpps.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No opportunities pinned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedOpps.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
                          {item.opp_type}
                        </span>
                        <button
                          onClick={() => handleRemoveOpp(item.opp_id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                          title="Unpin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Link href={`/opportunities/${item.slug}`}>
                        <h4 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition">
                          {item.title}
                        </h4>
                      </Link>
                      {item.financial_aid_amount && (
                        <p className="text-xs font-bold text-emerald-700 mt-2">
                          Aid: {item.financial_aid_amount}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end mt-4">
                      <Link
                        href={`/opportunities/${item.slug}`}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Check Eligibility <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
