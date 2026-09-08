import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  orgName?: string;
  verifiedAt?: string;
  className?: string;
}

export function VerifiedBadge({ orgName, verifiedAt, className = '' }: VerifiedBadgeProps) {
  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold ${className}`}
      title={`Verified against official records on ${formattedDate}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>
        Source: {orgName ? `Official ${orgName}` : 'Official Authority'} • Verified {formattedDate}
      </span>
    </div>
  );
}
