'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import { Bell, Check, Clock, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Fetch notifs error:', err);
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
      fetchNotifs();
    }
  }, [user, authLoading, router]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifs();
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Bell className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Student Alerts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time deadline reminders, date extensions, admit cards, and result releases
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllRead}
            className="px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-600" /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading alerts...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You are all caught up!</h3>
          <p className="text-xs text-slate-500">
            No new exam deadline notifications at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-100'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400">
                  <span>
                    {new Date(notif.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                    >
                      View Notice Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
