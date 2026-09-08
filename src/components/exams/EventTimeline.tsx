import React from 'react';
import { ExamEvent, EventStatus, EventType } from '@/types';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileEdit,
  Download,
  Award,
  Users,
  ExternalLink,
  Info
} from 'lucide-react';

interface EventTimelineProps {
  events: ExamEvent[];
}

const eventTypeIcons: Record<EventType, React.ReactNode> = {
  registration: <Calendar className="w-4 h-4" />,
  correction_window: <FileEdit className="w-4 h-4" />,
  admit_card: <Download className="w-4 h-4" />,
  exam: <Clock className="w-4 h-4" />,
  answer_key: <FileEdit className="w-4 h-4" />,
  result: <Award className="w-4 h-4" />,
  counselling: <Users className="w-4 h-4" />,
  admission: <Award className="w-4 h-4" />,
};

const statusBadges: Record<
  EventStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  open: {
    label: 'Open Now',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1"></span>,
  },
  closing_soon: {
    label: 'Closing Soon',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <AlertCircle className="w-3 h-3 text-amber-600 mr-1" />,
  },
  upcoming: {
    label: 'Upcoming (Notified)',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <Clock className="w-3 h-3 text-blue-600 mr-1" />,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: <CheckCircle className="w-3 h-3 text-slate-500 mr-1" />,
  },
  closed: {
    label: 'Closed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>,
  },
  unannounced: {
    label: 'Not Officially Announced Yet',
    bg: 'bg-amber-50/80',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <Info className="w-3 h-3 text-amber-600 mr-1" />,
  },
  delayed: {
    label: 'Postponed / Delayed',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: <AlertCircle className="w-3 h-3 text-orange-600 mr-1" />,
  },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Not officially announced yet';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function EventTimeline({ events }: EventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
        No event schedule announced yet by the conducting authority.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-6">
      {events.map((event, idx) => {
        const badge = statusBadges[event.status] || statusBadges.upcoming;
        const icon = eventTypeIcons[event.event_type] || <Calendar className="w-4 h-4" />;

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Dot Icon */}
            <div
              className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition ${
                event.status === 'open'
                  ? 'bg-emerald-600 ring-4 ring-emerald-100'
                  : event.status === 'closing_soon'
                  ? 'bg-amber-500 ring-4 ring-amber-100'
                  : event.status === 'completed'
                  ? 'bg-slate-400'
                  : event.status === 'unannounced'
                  ? 'bg-slate-300'
                  : 'bg-blue-600 ring-4 ring-blue-50'
              }`}
            >
              {icon}
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-base">{event.title}</h4>
                  <span
                    className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                {event.is_extended && (
                  <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-300 rounded-md">
                    ⚡ Date Extended
                  </span>
                )}
              </div>

              {/* Date Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Start / Opening Date
                  </span>
                  <span className={`font-semibold ${!event.start_date ? 'text-amber-700 italic' : 'text-slate-800'}`}>
                    {formatDate(event.start_date)}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    End / Closing Deadline
                  </span>
                  <div>
                    <span className={`font-semibold ${!event.end_date ? 'text-amber-700 italic' : 'text-slate-800'}`}>
                      {formatDate(event.end_date)}
                    </span>
                    {event.previous_end_date && (
                      <span className="block text-xs text-slate-400 line-through">
                        Earlier: {formatDate(event.previous_end_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Unannounced Notice */}
              {event.status === 'unannounced' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 mt-2 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-amber-950">Official Schedule Awaited:</strong>
                    The conducting body has not officially released the dates for this stage yet. ExamSetu adheres to a zero-hallucination policy and updates within minutes of official gazette release.
                  </div>
                </div>
              )}

              {/* Notes */}
              {event.notes && event.status !== 'unannounced' && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 leading-relaxed">
                  <strong>Official Note:</strong> {event.notes}
                </p>
              )}

              {/* Source Verification Link */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Last verified:{' '}
                  {event.last_verified_at
                    ? new Date(event.last_verified_at).toLocaleDateString('en-IN')
                    : 'Verified'}
                </span>
                {event.official_source_url && (
                  <a
                    href={event.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    Official Document Reference <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
