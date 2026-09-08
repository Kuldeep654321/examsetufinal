'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  Bell,
  CheckCircle2,
  Save,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [classLevel, setClassLevel] = useState('12');
  const [board, setBoard] = useState('CBSE');
  const [state, setState] = useState('Madhya Pradesh');
  const [stream, setStream] = useState('PCB');
  const [targetExams, setTargetExams] = useState<string[]>(['NEET UG', 'CUET UG']);
  const [careerInterests, setCareerInterests] = useState<string[]>(['Medicine', 'Biotechnology']);
  const [phone, setPhone] = useState('');

  // Notification Preferences
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifWebPush, setNotifWebPush] = useState(true);
  const [notifDeadlines, setNotifDeadlines] = useState(true);
  const [notifAdmitCards, setNotifAdmitCards] = useState(true);
  const [notifResults, setNotifResults] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      setFullName(user.full_name || '');
      const p = (user as any).profile || {};
      if (p.class_level) setClassLevel(p.class_level);
      if (p.board) setBoard(p.board);
      if (p.state) setState(p.state);
      if (p.stream) setStream(p.stream);
      if (p.phone_number) setPhone(p.phone_number);
      if (p.target_exams) {
        setTargetExams(typeof p.target_exams === 'string' ? JSON.parse(p.target_exams) : p.target_exams);
      }
      if (p.career_interests) {
        setCareerInterests(typeof p.career_interests === 'string' ? JSON.parse(p.career_interests) : p.career_interests);
      }
      if (p.notification_preferences) {
        const np = typeof p.notification_preferences === 'string' ? JSON.parse(p.notification_preferences) : p.notification_preferences;
        if (np.email !== undefined) setNotifEmail(np.email);
        if (np.in_app !== undefined) setNotifInApp(np.in_app);
        if (np.web_push !== undefined) setNotifWebPush(np.web_push);
        if (np.deadline_reminders !== undefined) setNotifDeadlines(np.deadline_reminders);
        if (np.admit_card_alerts !== undefined) setNotifAdmitCards(np.admit_card_alerts);
        if (np.result_alerts !== undefined) setNotifResults(np.result_alerts);
      }
    }
  }, [user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          class_level: classLevel,
          board,
          state,
          stream,
          phone_number: phone,
          target_exams: targetExams,
          career_interests: careerInterests,
          notification_preferences: {
            email: notifEmail,
            in_app: notifInApp,
            web_push: notifWebPush,
            deadline_reminders: notifDeadlines,
            admit_card_alerts: notifAdmitCards,
            result_alerts: notifResults,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSavedSuccess(true);
        await refreshUser();
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setErrorMessage('Network error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleTargetExam = (examName: string) => {
    if (targetExams.includes(examName)) {
      setTargetExams(targetExams.filter((t) => t !== examName));
    } else {
      setTargetExams([...targetExams, examName]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <User className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Student Settings
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Profile &amp; Intelligence Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fine-tune your target examinations, academic streams, and alert channels for personalized recommendations
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile preferences saved successfully! Dashboard feed has been updated.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs font-medium">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address (Read-Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number (Optional for SMS/WhatsApp Alerts)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Academic Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-blue-600" /> Academic Profile &amp; Stream Focus
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Current Class / Level</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="10">Class 10th</option>
                <option value="12">Class 12th</option>
                <option value="Undergraduate">Undergraduate (B.Sc / B.Tech / B.Com / B.A)</option>
                <option value="Graduate">Graduate / Degree Holder</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Stream</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
                <option value="PCM">PCM (Physics, Chemistry, Mathematics)</option>
                <option value="Commerce">Commerce / Accountancy</option>
                <option value="Arts/Humanities">Arts / Humanities / Social Sciences</option>
                <option value="General">General / All-Stream</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Board of Examination</label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="CBSE">CBSE (Central Board)</option>
                <option value="MPBSE">MP Board (MPBSE)</option>
                <option value="ICSE">ICSE / ISC</option>
                <option value="State Board">State Board (UPMSP, BSEB, etc.)</option>
                <option value="NIOS">NIOS Open School</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">State / Region Domicile</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Bihar">Bihar</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="All India">All India</option>
              </select>
            </div>
          </div>

          {/* Target Exams Multi-Select Chips */}
          <div className="pt-2">
            <label className="block text-slate-700 font-bold mb-2">Target Examinations (Click to toggle)</label>
            <div className="flex flex-wrap gap-2">
              {[
                'NEET UG',
                'JEE Main',
                'CUET UG',
                'UPSC CSE',
                'SSC CGL',
                'MP Board 12th',
                'CBSE Class 12',
                'CLAT UG',
                'CAT IIM',
                'IBPS PO',
                'NSP Scholarship',
              ].map((exam) => {
                const isSelected = targetExams.includes(exam);
                return (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => toggleTargetExam(exam)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{exam}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-blue-600" /> Alert &amp; Notification Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">Email Notifications</span>
                <span className="text-[11px] text-slate-500">
                  Receive verified deadline notices directly to your inbox
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
              <input
                type="checkbox"
                checked={notifInApp}
                onChange={(e) => setNotifInApp(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">In-App Notification Center</span>
                <span className="text-[11px] text-slate-500">
                  Show red badge and real-time dashboard notifications
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
              <input
                type="checkbox"
                checked={notifDeadlines}
                onChange={(e) => setNotifDeadlines(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">Deadline Approaching Alerts</span>
                <span className="text-[11px] text-slate-500">
                  Alerts 7 days, 3 days, and 1 day before application closes
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
              <input
                type="checkbox"
                checked={notifAdmitCards}
                onChange={(e) => setNotifAdmitCards(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">Admit Card &amp; Exam City Releases</span>
                <span className="text-[11px] text-slate-500">
                  Instant notification when official hall tickets go live
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
