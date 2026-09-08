'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import { ShieldCheck, Lock, Mail, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classLevel, setClassLevel] = useState('12');
  const [board, setBoard] = useState('CBSE');
  const [state, setState] = useState('Madhya Pradesh');
  const [stream, setStream] = useState('PCB');
  const [targetExam, setTargetExam] = useState('NEET UG');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          class_level: classLevel,
          board,
          state,
          stream,
          target_exams: [targetExam],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        await refreshUser();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
            ES
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create Student Account</h1>
          <p className="text-xs text-slate-500">
            Set up your academic profile to receive verified exam &amp; scholarship intelligence
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Password (Min 8 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Academic Personalization Fields */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
              Academic Intelligence Profile
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Current Class</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="10">Class 10th</option>
                  <option value="12">Class 12th</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Stream</label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="PCB">PCB (Medical)</option>
                  <option value="PCM">PCM (Engineering)</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts/Humanities">Arts / Humanities</option>
                  <option value="General">General / Any</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Board</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="CBSE">CBSE Board</option>
                  <option value="MPBSE">MP Board (MPBSE)</option>
                  <option value="ICSE">ICSE / ISC</option>
                  <option value="State Board">State Board</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="All India">All India</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Primary Target Exam</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-blue-700"
              >
                <option value="NEET UG">NEET UG (Medical)</option>
                <option value="JEE Main">JEE Main (Engineering)</option>
                <option value="CUET UG">CUET UG (Universities)</option>
                <option value="UPSC CSE">UPSC CSE (Civil Services)</option>
                <option value="SSC CGL">SSC CGL (Staff Selection)</option>
                <option value="MP Board 12th">MP Board 12th</option>
                <option value="CBSE Class 12">CBSE Class 12</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
