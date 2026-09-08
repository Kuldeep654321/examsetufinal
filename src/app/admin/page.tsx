'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import {
  ShieldCheck,
  Activity,
  Layers,
  FileCheck2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Users,
  Bell,
  Cpu
} from 'lucide-react';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data.data);
      }
    } catch (err) {
      console.error('Overview error:', err);
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
      fetchOverview();
    }
  }, [user, authLoading, router]);

  const triggerWorkerSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/worker/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`Worker sync completed! Processed ${data.result.sourcesProcessed} sources, queued ${data.result.queuedForReview} items.`);
        fetchOverview();
      } else {
        setSyncMessage(`Worker failed: ${data.error}`);
      }
    } catch (err: any) {
      setSyncMessage('Failed to trigger worker');
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500 text-sm">
        <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading Admin Command Center...</p>
      </div>
    );
  }

  const health = overview?.sourcesHealth || {};
  const counts = overview?.counts || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> ExamSetu Intelligence Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            System Health &amp; Verification Ops
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Logged in as <strong>{user?.full_name}</strong> ({user?.role?.toUpperCase()})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={triggerWorkerSync}
            disabled={syncing}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Official Sources...' : 'Trigger Full Source Crawl'}
          </button>
          <Link
            href="/admin/manual-update"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            + Manual Verified Notice
          </Link>
        </div>
      </div>

      {syncMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200">
          {syncMessage}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Pending Review Queue */}
        <Link
          href="/admin/review-queue"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Review Queue</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{overview?.pendingReviews || 0}</span>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">Pending verification</p>
          </div>
        </Link>

        {/* Source Health */}
        <Link
          href="/admin/sources"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Sources Online</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-600">
              {health.healthy || 0} / {health.total || 0}
            </span>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Avg Latency: {health.avgResponseTimeMs || 0}ms
            </p>
          </div>
        </Link>

        {/* Total Verified Exams */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tracked Exams</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{counts.exams || 0}</span>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">100% Normalized</p>
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Opportunities</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-900">{counts.opportunities || 0}</span>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Active Programs</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar for Admin Sections */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 text-xs font-bold">
        <Link
          href="/admin/review-queue"
          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition flex items-center gap-1.5"
        >
          <FileCheck2 className="w-4 h-4 text-amber-700" /> Human Review Queue ({overview?.pendingReviews || 0})
        </Link>
        <Link
          href="/admin/sources"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5"
        >
          <Activity className="w-4 h-4 text-emerald-600" /> Source Health Registry
        </Link>
        <Link
          href="/admin/manual-update"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5"
        >
          + Publish Manual Verified Notice
        </Link>
        <Link
          href="/admin/audit-logs"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5"
        >
          <Clock className="w-4 h-4 text-slate-500" /> Security &amp; Change Audit Logs
        </Link>
      </div>

      {/* Recent Fetch Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" /> Recent Source Crawl Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3 border-b border-slate-200">Source Authority</th>
                <th className="p-3 border-b border-slate-200">Status</th>
                <th className="p-3 border-b border-slate-200">Latency</th>
                <th className="p-3 border-b border-slate-200">Items Detected</th>
                <th className="p-3 border-b border-slate-200">Fetched Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {overview?.recentLogs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{log.source_name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        log.status_code === 200
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      HTTP {log.status_code}
                    </span>
                  </td>
                  <td className="p-3">{log.response_time_ms} ms</td>
                  <td className="p-3 font-bold text-blue-700">{log.items_detected} notices</td>
                  <td className="p-3 text-slate-500">
                    {new Date(log.fetched_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
