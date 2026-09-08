'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import {
  Activity,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function SourceHealthPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSourceId, setFetchingSourceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/admin/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.data || []);
      }
    } catch (err) {
      console.error('Fetch sources error:', err);
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
      fetchSources();
    }
  }, [user, authLoading, router]);

  const handleToggle = async (sourceId: string, currentEnabled: boolean) => {
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, is_enabled: !currentEnabled }),
      });
      if (res.ok) {
        fetchSources();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleTriggerSingleFetch = async (sourceId: string) => {
    setFetchingSourceId(sourceId);
    setFeedback('');
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, triggerFetch: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message);
        fetchSources();
      } else {
        alert(data.error || 'Fetch failed');
      }
    } catch (err) {
      alert('Error triggering source crawl');
    } finally {
      setFetchingSourceId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/admin" className="hover:text-blue-600">Admin</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Source Health Registry</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Activity className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Official Source Registry &amp; Health Monitoring
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Source Status &amp; Adapter Health
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of official conducting authority adapters (NTA, UPSC, SSC, CBSE, MPBSE, MPPSC, IBPS, NSP)
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200">
          {feedback}
        </div>
      )}

      {/* Sources Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading sources...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Official Organization</th>
                  <th className="p-4">Domain &amp; Adapter</th>
                  <th className="p-4">Health Status</th>
                  <th className="p-4">Response Latency</th>
                  <th className="p-4">Check Interval</th>
                  <th className="p-4">Enabled</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-50/80">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{src.name}</span>
                      <span className="text-[11px] text-slate-500">{src.org_name}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-blue-700 block">{src.official_domain}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{src.adapter_name}</span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          src.health_status === 'healthy'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : src.health_status === 'layout_changed'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            src.health_status === 'healthy'
                              ? 'bg-emerald-500'
                              : src.health_status === 'layout_changed'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        ></span>
                        {src.health_status === 'healthy'
                          ? '🟢 Healthy'
                          : src.health_status === 'layout_changed'
                          ? '🟡 Layout Changed'
                          : '🔴 Failed'}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-700">
                      {src.response_time_ms ? `${src.response_time_ms} ms` : '—'}
                    </td>

                    <td className="p-4 text-slate-600">
                      Every {src.check_interval_minutes} mins
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggle(src.id, src.is_enabled)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border transition ${
                          src.is_enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {src.is_enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleTriggerSingleFetch(src.id)}
                        disabled={fetchingSourceId === src.id}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition inline-flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${fetchingSourceId === src.id ? 'animate-spin' : ''}`} />
                        {fetchingSourceId === src.id ? 'Fetching...' : 'Re-fetch'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
