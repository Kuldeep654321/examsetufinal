'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, X, Award, DollarSign, Filter, ChevronRight } from 'lucide-react';
import { OppCard } from '@/components/opportunities/OppCard';
import { Opportunity } from '@/types';

const oppTypes = [
  { slug: 'all', name: 'All Opportunities' },
  { slug: 'scholarship', name: 'Scholarships' },
  { slug: 'fellowship', name: 'Fellowships' },
  { slug: 'internship', name: 'Internships' },
  { slug: 'apprenticeship', name: 'Apprenticeships' },
  { slug: 'competition', name: 'Competitions & Olympiads' },
  { slug: 'job', name: 'Government Jobs' },
];

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpps() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedType !== 'all') params.set('type', selectedType);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());

        const res = await fetch(`/api/opportunities?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setOpps(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOpps();
  }, [selectedType, selectedStatus, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <Sparkles className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Opportunity Intelligence
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Government Scholarships, Fellowships & Internships
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Legitimate, verified financial aid programs from National Scholarship Portal (NSP), DST, AICTE, ISRO, DRDO, and premier institutions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scholarship name, qualification, or benefit (e.g., NSP, INSPIRE, DRDO, Class 12)..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Opportunity Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {oppTypes.map((type) => (
            <button
              key={type.slug}
              onClick={() => setSelectedType(type.slug)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                selectedType === type.slug
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Status Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Application Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Now</option>
              <option value="closing_soon">Closing Soon</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          <div className="col-span-3 flex items-end justify-end">
            {(selectedType !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 py-1.5"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : opps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No opportunities match the selected criteria</h3>
          <p className="text-xs text-slate-500">Try clearing your filters to explore all available opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opps.map((opp) => (
            <OppCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}
    </div>
  );
}
