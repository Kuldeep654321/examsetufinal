'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import {
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Exam } from '@/types';

export default function ManualUpdatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [updateType, setUpdateType] = useState('date_extended');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [docRef, setDocRef] = useState('');
  const [isBreaking, setIsBreaking] = useState(true);
  const [updateEventDate, setUpdateEventDate] = useState(false);
  const [eventType, setEventType] = useState('registration');
  const [newEndDate, setNewEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'verifier'))) {
      router.push('/login');
      return;
    }

    fetch('/api/exams?limit=50')
      .then((r) => r.json())
      .then((d) => {
        setExams(d.data || []);
        if (d.data?.length > 0) setSelectedExamId(d.data[0].id);
      })
      .catch((err) => console.error(err));
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload: any = {
        exam_id: selectedExamId,
        title,
        summary,
        update_type: updateType,
        old_value: oldValue || undefined,
        new_value: newValue || undefined,
        official_source_url: officialUrl,
        official_doc_ref: docRef || undefined,
        is_breaking: isBreaking,
      };

      if (updateEventDate && newEndDate) {
        payload.update_event = {
          event_type: eventType,
          end_date: newEndDate,
          is_extended: true,
          status: 'closing_soon',
        };
      }

      const res = await fetch('/api/admin/manual-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        setTitle('');
        setSummary('');
        setOldValue('');
        setNewValue('');
        setOfficialUrl('');
        setDocRef('');
      } else {
        setErrorMsg(data.error || 'Failed to publish manual update');
      }
    } catch (err: any) {
      setErrorMsg('Error submitting update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/admin" className="hover:text-blue-600">Admin</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800">Publish Verified Notice</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <FileText className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Admin Manual Override &amp; Verification
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Publish Verified Official Notice
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Broadcast breaking exam updates and date extensions directly with verified official attribution
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 text-xs font-medium">
        {/* Select Target Exam */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Target Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.short_title})
              </option>
            ))}
          </select>
        </div>

        {/* Update Title */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Official Notice Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. NEET UG 2027 Registration Extended to 16 March 2027"
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          />
        </div>

        {/* Notice Summary */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Detailed Summary &amp; Press Release Text</label>
          <textarea
            required
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="National Testing Agency has extended the deadline following student representation..."
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed"
          />
        </div>

        {/* Update Type & Breaking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Update Category</label>
            <select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            >
              <option value="date_extended">Date Extended</option>
              <option value="admit_card_out">Admit Card Released</option>
              <option value="result_declared">Result Declared</option>
              <option value="syllabus_updated">Syllabus / Pattern Updated</option>
              <option value="correction_opened">Correction Window Opened</option>
              <option value="general">General Notice</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="breakingCheck"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="breakingCheck" className="text-slate-800 font-bold">
              Mark as Breaking Update (Dispatches Student Alerts)
            </label>
          </div>
        </div>

        {/* Value Diff (Old Value -> New Value) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Previous / Old Value (Optional)</label>
            <input
              type="text"
              value={oldValue}
              onChange={(e) => setOldValue(e.target.value)}
              placeholder="e.g. 09 March 2027"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">New Verified Value</label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="e.g. 16 March 2027"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-emerald-800 font-bold"
            />
          </div>
        </div>

        {/* Official Source Attribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Official Document / Notice URL</label>
            <input
              type="url"
              required
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://exams.nta.ac.in/NEET/notice.pdf"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-blue-700"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Official Notification Ref No.</label>
            <input
              type="text"
              value={docRef}
              onChange={(e) => setDocRef(e.target.value)}
              placeholder="e.g. NTA/NEET/2027/Notice-04"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Optional Live Timeline Event Modification */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="updateEventCheck"
              checked={updateEventDate}
              onChange={(e) => setUpdateEventDate(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="updateEventCheck" className="text-slate-800 font-bold">
              Also update live Exam Event Timeline in database
            </label>
          </div>

          {updateEventDate && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Event Stage</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="registration">Registration Window</option>
                  <option value="correction_window">Correction Window</option>
                  <option value="admit_card">Admit Card Release</option>
                  <option value="exam">Exam Date</option>
                  <option value="answer_key">Answer Key</option>
                  <option value="result">Result Declaration</option>
                  <option value="counselling">Counselling</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">New Event Deadline / Date</label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          {loading ? 'Publishing & Dispatched...' : 'Publish Verified Notice & Dispatch Student Alerts'}
        </button>
      </form>
    </div>
  );
}
