'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import { Clock, ShieldCheck, ChevronRight, Lock, User } from 'lucide-react';

export default function AuditLogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetch('/api/admin/audit-logs')
        .then((r) => r.json())
        .then((d) => setLogs(d.data || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/admin" className="hover:text-blue-600">Admin</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Audit Logs</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-slate-100 text-slate-800">
            <Lock className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Compliance &amp; Security
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Immutable Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete log of all administrative actions, verified update approvals, and source toggles
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading audit trail...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin / Verifier</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Entity ID</th>
                  <th className="p-4">Modified State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{log.user_name || 'System Worker'}</span>
                      <span className="text-[11px] text-slate-400">{log.user_email || 'automated'}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-slate-600">{log.entity_type}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                      {log.entity_id}
                    </td>
                    <td className="p-4 max-w-xs truncate text-[11px] font-mono text-slate-500">
                      {log.new_state ? JSON.stringify(log.new_state) : '—'}
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
