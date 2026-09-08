'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import {
  FileCheck2,
  Check,
  X,
  Edit2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function ReviewQueuePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await fetch(`/api/admin/review-queue?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setQueueItems(data.data || []);
      }
    } catch (err) {
      console.error('Fetch review queue error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'verifier'))) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchQueue();
    }
  }, [user, authLoading, statusFilter, router]);

  const handleAction = async (queueId: string, action: 'approve' | 'reject') => {
    setActionLoading(queueId);
    setFeedbackMessage('');
    try {
      const res = await fetch('/api/admin/review-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, action }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage(data.message);
        fetchQueue();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (err: any) {
      alert('Error executing review action');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/admin" className="hover:text-blue-600">Admin</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Review Queue</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Human-in-the-Loop Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Verification Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect AI-extracted event updates, verify official PDF diffs, and approve changes to live database
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition capitalize ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200">
          {feedbackMessage}
        </div>
      )}

      {/* Queue Items List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading review items...</div>
      ) : queueItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Review queue is clean!</h3>
          <p className="text-xs text-slate-500">
            All extracted source notices have been processed and verified.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {queueItems.map((item) => {
            const confidencePercent = Math.round((item.ai_confidence || 0.8) * 100);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {item.source_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.review_status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : item.review_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Status: {item.review_status}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                      {item.document_title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target Entity: <strong>{item.target_entity_name || item.target_entity_type}</strong>
                    </p>
                  </div>

                  {/* AI Confidence Meter */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs">
                    <span className="font-bold text-slate-500">AI Extraction Confidence</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            confidencePercent >= 90
                              ? 'bg-emerald-500'
                              : confidencePercent >= 75
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${confidencePercent}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">{confidencePercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Diff Summary Grid */}
                {item.diff_summary && item.diff_summary.length > 0 ? (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                      Detected Field Modifications (Diff)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.diff_summary.map((diff: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-semibold text-slate-500 block mb-1">{diff.field}</span>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-red-600 line-through">
                              Old: {diff.old_value !== null ? String(diff.old_value) : 'None'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              New: {String(diff.new_value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                    No field diff recorded. Entity will be indexed as new notification update.
                  </div>
                )}

                {/* AI Reasoning */}
                {item.ai_reasoning && (
                  <p className="text-xs text-slate-600 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <strong>Extraction Reasoning:</strong> {item.ai_reasoning}
                  </p>
                )}

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <a
                    href={item.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View Official Source PDF / Notice <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {item.review_status === 'pending' && (
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleAction(item.id, 'reject')}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject Notice
                      </button>

                      <button
                        onClick={() => handleAction(item.id, 'approve')}
                        disabled={actionLoading === item.id}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve &amp; Publish Live
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
