import React from 'react';
import { ExternalLink, ShieldCheck, Phone, Mail, FileText, Globe } from 'lucide-react';
import { Organization } from '@/types';

interface OfficialSourceBoxProps {
  organization: Organization;
  officialWebsiteUrl: string;
  registrationUrl?: string;
  syllabusUrl?: string;
  lastVerifiedAt?: string;
}

export function OfficialSourceBox({
  organization,
  officialWebsiteUrl,
  registrationUrl,
  syllabusUrl,
  lastVerifiedAt,
}: OfficialSourceBoxProps) {
  const formattedDate = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-blue-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Official Conducting Authority
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {organization.name} ({organization.short_name})
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Verified Domain: <span className="font-mono text-blue-300">{organization.official_domain}</span>
          </p>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-400">
          <span>Last System Verification</span>
          <p className="font-semibold text-slate-200">{formattedDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <a
          href={officialWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md hover:shadow-lg"
        >
          <Globe className="w-4 h-4" /> Official Portal <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>

        {registrationUrl && (
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md hover:shadow-lg"
          >
            Apply Online Portal <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        )}

        {syllabusUrl && (
          <a
            href={syllabusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition border border-white/15"
          >
            <FileText className="w-4 h-4 text-blue-300" /> Official Syllabus PDF
          </a>
        )}
      </div>

      {/* Helplines */}
      {(organization.helpline_number || organization.contact_email) && (
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          {organization.helpline_number && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" /> Official Helpline: {organization.helpline_number}
            </span>
          )}
          {organization.contact_email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Support Email: {organization.contact_email}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
