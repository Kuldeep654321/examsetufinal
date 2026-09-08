'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import {
  Search,
  Bell,
  ShieldCheck,
  User as UserIcon,
  BookOpen,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Layers,
  FileCheck2,
  Bookmark
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setUnreadCount(data.data.filter((n: any) => !n.is_read).length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const isAdminOrVerifier = user?.role === 'admin' || user?.role === 'verifier';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        {/* Top Government & Verification Banner */}
        <div className="bg-slate-900 text-white text-[11px] font-medium py-1 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Official Update Engine: Continuous Verification Active</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Official Sources Only
            </span>
            <span>•</span>
            <span>examsetu.in</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg group-hover:scale-105 transition-transform">
                ES
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  Exam<span className="text-blue-600">Setu</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                  परीक्षा सेतु • National Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/exams"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  pathname.startsWith('/exams')
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Examinations
                </span>
              </Link>
              <Link
                href="/opportunities"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  pathname.startsWith('/opportunities')
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Scholarships & Jobs
                </span>
              </Link>
              <Link
                href="/search"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  pathname === '/search'
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Explore All
              </Link>
            </nav>
          </div>

          {/* Search Trigger Button */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs text-slate-500 transition shadow-inner"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search NEET, CBSE 12th, UPSC, Scholarships...</span>
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white rounded border border-slate-200 shadow-sm">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action / Profile */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notification Bell */}
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Dashboard Shortcut */}
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                >
                  <LayoutDashboard className="w-4 h-4" /> Student Portal
                </Link>

                {/* Admin / Verifier Command Center */}
                {isAdminOrVerifier && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-700" /> Admin
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="mt-1 inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/tracker"
                        className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <FileCheck2 className="w-4 h-4 text-slate-400" /> Application Tracker
                      </Link>
                      <Link
                        href="/dashboard/saved"
                        className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" /> Saved Items
                      </Link>
                      {isAdminOrVerifier && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3.5 py-2 text-amber-800 bg-amber-50/50 hover:bg-amber-50 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Command Center
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition"
                >
                  Get Started Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
            <Link
              href="/exams"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <BookOpen className="w-4 h-4 text-blue-600" /> Examinations Directory
            </Link>
            <Link
              href="/opportunities"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Scholarships & Jobs
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Search className="w-4 h-4 text-slate-400" /> Global Search
            </Link>
            {user && (
              <>
                <div className="border-t border-slate-100 pt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                  </Link>
                </div>
                {isAdminOrVerifier && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-bold text-amber-800 bg-amber-50"
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Command Center
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
