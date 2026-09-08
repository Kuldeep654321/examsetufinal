'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import {
  FileCheck2,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Lock,
  ChevronRight,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { TrackerStatus } from '@/types';

const statusColumns: { id: TrackerStatus; label: string; bg: string; text: string }[] = [
  { id: 'interested', label: 'Interested', bg: 'bg-slate-100', text: 'text-slate-800' },
  { id: 'will_apply', label: 'Will Apply', bg: 'bg-blue-50', text: 'text-blue-800' },
  { id: 'applied', label: 'Applied', bg: 'bg-indigo-50', text: 'text-indigo-800' },
  { id: 'admit_card_received', label: 'Admit Card In Hand', bg: 'bg-purple-50', text: 'text-purple-800' },
  { id: 'exam_completed', label: 'Exam Completed', bg: 'bg-amber-50', text: 'text-amber-800' },
  { id: 'result_available', label: 'Result Declared', bg: 'bg-emerald-50', text: 'text-emerald-800' },
];

export default function ApplicationTrackerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [trackerItems, setTrackerItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form states
  const [status, setStatus] = useState<TrackerStatus>('applied');
  const [appNumber, setAppNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examCenter, setExamCenter] = useState('');
  const [notes, setNotes] = useState('');

  const fetchTracker = async () => {
    try {
      const res = await fetch('/api/tracker');
      if (res.ok) {
        const data = await res.json();
        setTrackerItems(data.data || []);
      }
    } catch (err) {
      console.error('Tracker load error:', err);
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
      fetchTracker();
    }
  }, [user, authLoading, router]);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setStatus(item.status);
    setAppNumber(item.application_number || '');
    setRollNumber(item.roll_number || '');
    setExamDate(item.exam_date ? item.exam_date.substring(0, 10) : '');
    setExamCenter(item.exam_center || '');
    setNotes(item.private_notes || '');
    setEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: selectedItem.target_type,
          target_id: selectedItem.target_id,
          status,
          application_number: appNumber,
          roll_number: rollNumber,
          exam_date: examDate || null,
          exam_center: examCenter,
          private_notes: notes,
        }),
      });

      if (res.ok) {
        setEditModalOpen(false);
        fetchTracker();
      }
    } catch (err) {
      console.error('Save tracker item error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item from your tracker?')) return;
    try {
      const res = await fetch(`/api/tracker?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTracker();
      }
    } catch (err) {
      console.error('Delete tracker error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Student Application Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Application Tracker &amp; Exam Checklist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> Private &amp; Secure. Your registration details and notes are strictly confidential.
          </p>
        </div>

        <Link
          href="/exams"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Exam to Track
        </Link>
      </div>

      {/* Tracker Items List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          Loading application tracker...
        </div>
      ) : trackerItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your application pipeline is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse examinations (like NEET, JEE, UPSC, CBSE 12th) and click &quot;Track My Application&quot; to organize your journey.
          </p>
          <Link
            href="/exams"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-500 transition mt-2"
          >
            Explore Examinations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackerItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {item.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Application Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Link href={`/${item.target_type === 'exam' ? 'exams' : 'opportunities'}/${item.target_slug}`}>
                  <h3 className="font-bold text-base text-slate-900 hover:text-blue-600 transition line-clamp-2">
                    {item.target_title}
                  </h3>
                </Link>

                {/* Details */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {item.application_number && (
                    <p>
                      <strong className="text-slate-700">App No:</strong>{' '}
                      <span className="font-mono text-slate-900 font-bold">{item.application_number}</span>
                    </p>
                  )}
                  {item.roll_number && (
                    <p>
                      <strong className="text-slate-700">Roll No:</strong>{' '}
                      <span className="font-mono text-slate-900 font-bold">{item.roll_number}</span>
                    </p>
                  )}
                  {item.exam_date && (
                    <p className="flex items-center gap-1 text-slate-800 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Exam Date:{' '}
                      {new Date(item.exam_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {item.exam_center && (
                    <p className="text-slate-500">
                      Center: <strong>{item.exam_center}</strong>
                    </p>
                  )}
                </div>

                {/* Private Notes */}
                {item.private_notes && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                    &ldquo;{item.private_notes}&rdquo;
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Updated: {new Date(item.updated_at).toLocaleDateString('en-IN')}
                </span>
                <Link
                  href={`/${item.target_type === 'exam' ? 'exams' : 'opportunities'}/${item.target_slug}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  Official Page <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              Update Application: {selectedItem?.target_title}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Application Status Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TrackerStatus)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  {statusColumns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Application / Registration No.</label>
                  <input
                    type="text"
                    value={appNumber}
                    onChange={(e) => setAppNumber(e.target.value)}
                    placeholder="e.g. 2704100982"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Roll / Hall Ticket No.</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. MP0301042"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Exam Center Allotment</label>
                  <input
                    type="text"
                    value={examCenter}
                    onChange={(e) => setExamCenter(e.target.value)}
                    placeholder="e.g. Holkar Science College, Indore"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Private Student Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Need to revise Biology NCERT Diagrams & carry Aadhaar original..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
