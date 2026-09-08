'use client';

import React, { useState } from 'react';
import { Bookmark, FileCheck2, Check, Share2 } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthContext';

interface ExamTrackerButtonProps {
  examId: string;
  examTitle: string;
}

export function ExamTrackerButton({ examId, examTitle }: ExamTrackerButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tracker/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'exam', id: examId }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTracker = async () => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'exam',
          target_id: examId,
          status: 'interested',
          private_notes: `Added from ${examTitle} detail page`,
        }),
      });
      if (res.ok) {
        setTracked(true);
      }
    } catch (err) {
      console.error('Tracker add failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: examTitle,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleShare}
        className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs transition"
        title="Share Official Link"
      >
        <Share2 className="w-4 h-4" />
      </button>

      <button
        onClick={handleSave}
        disabled={loading || saved}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
          saved
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-blue-600 text-blue-600' : ''}`} />
        {saved ? 'Saved in Bookmarks' : 'Save'}
      </button>

      <button
        onClick={handleAddToTracker}
        disabled={loading || tracked}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
          tracked
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <FileCheck2 className="w-3.5 h-3.5" />
        {tracked ? 'Tracking in Dashboard' : '+ Track My Application'}
      </button>
    </div>
  );
}
