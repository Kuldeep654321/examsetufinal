'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Sparkles,
  FileCheck2,
  Bookmark,
  Bell,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Award,
  ExternalLink,
  Plus
} from 'lucide-react';
import { ExamCard } from '@/components/exams/ExamCard';
import { OppCard } from '@/components/opportunities/OppCard';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetch('/api/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDashboardData(data.data);
          }
        })
        .catch((err) => console.error('Dashboard load error:', err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-sm">Loading your personalized intelligence feed...</p>
      </div>
    );
  }

  const profile = dashboardData?.profile || {};
  const updates = dashboardData?.updates || [];
  const deadlines = dashboardData?.deadlines || [];
  const recommendations = dashboardData?.recommendations || [];
  const trackerItems = dashboardData?.tracker || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Student Intelligence Radar Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Namaste, {user?.full_name}!
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Profile: Class {profile.class_level || '12'} • Stream: {profile.stream || 'PCB'} • State: {profile.state || 'Madhya Pradesh'}
            </p>
          </div>

          {/* Quick Dashboard Action Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/tracker"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" /> Application Tracker ({trackerItems.length})
            </Link>
            <Link
              href="/dashboard/saved"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              <Bookmark className="w-4 h-4" /> Saved Items
            </Link>
          </div>
        </div>
      </div>

      {/* Critical Upcoming Deadlines Banner */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" /> Critical Upcoming Deadlines
          </h2>
          <span className="text-xs font-bold text-slate-400">Within Next 60 Days</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deadlines.slice(0, 4).map((d: any) => (
            <div
              key={d.event_id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{d.org_short_name}</span>
                  <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    {d.status?.replace('_', ' ')}
                  </span>
                </div>
                <Link href={`/exams/${d.exam_slug}`}>
                  <h4 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition line-clamp-2">
                    {d.exam_title}
                  </h4>
                </Link>
                <p className="text-xs text-slate-500 mt-1">{d.event_title}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {new Date(d.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <Link href={`/exams/${d.exam_slug}`} className="text-blue-600 font-bold hover:underline flex items-center">
                  Details <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Tracker Preview & Today's Updates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Breaking & Verified Updates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Today&apos;s Verified Official Notices
              </h3>
              <span className="text-xs font-semibold text-slate-400">Continuous Sync</span>
            </div>

            <div className="space-y-3">
              {updates.map((up: any) => (
                <div key={up.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{up.title}</span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(up.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{up.summary}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {up.org_short_name}
                    </span>
                    <Link href={`/exams/${up.exam_slug}`} className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View Exam Schedule <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Opportunities */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Recommended Scholarships & Grants
              </h3>
              <Link href="/opportunities" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((opp: any) => (
                <div key={opp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                      {opp.opp_type}
                    </span>
                    <h4 className="font-bold text-slate-900 line-clamp-2">{opp.title}</h4>
                    <p className="text-slate-500 mt-1">{opp.qualification}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between font-bold">
                    <span className="text-emerald-700">{opp.financial_aid_amount || 'Merit Aid'}</span>
                    <Link href={`/opportunities/${opp.slug}`} className="text-blue-600 hover:text-blue-700">
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Private Application Tracker Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" /> My Application Pipeline
              </h3>
              <Link href="/dashboard/tracker" className="text-xs font-bold text-blue-600 hover:underline">
                Manage
              </Link>
            </div>

            {trackerItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                <p>You haven&apos;t added any applications to track yet.</p>
                <Link
                  href="/exams"
                  className="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg"
                >
                  Browse Exams to Track
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trackerItems.map((item: any) => (
                  <div key={item.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.target_title}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    {item.application_number && (
                      <p className="text-slate-500 font-mono text-[11px]">
                        App No: {item.application_number}
                      </p>
                    )}
                    {item.exam_date && (
                      <p className="text-slate-500">
                        Exam Date: <strong>{new Date(item.exam_date).toLocaleDateString('en-IN')}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
