'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        await refreshUser();
        if (data.user?.role === 'admin' || data.user?.role === 'verifier') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            ES
          </div>
          <h1 className="text-2xl font-black text-slate-900">Sign in to ExamSetu</h1>
          <p className="text-xs text-slate-500">
            Access your personalized exam intelligence &amp; application tracker
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Accounts Quick-Fill Pill */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
            Demo Credentials (Pre-Configured)
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail('student@examsetu.in');
                setPassword('Student@1234');
              }}
              className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 rounded font-bold transition"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@examsetu.in');
                setPassword('ExamAdmin@2026');
              }}
              className="px-2 py-1 bg-white hover:bg-amber-50 border border-slate-200 text-amber-800 rounded font-bold transition"
            >
              Admin Account
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('verifier@examsetu.in');
                setPassword('Verifier@2026');
              }}
              className="px-2 py-1 bg-white hover:bg-purple-50 border border-slate-200 text-purple-700 rounded font-bold transition"
            >
              Verifier Account
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  );
}
