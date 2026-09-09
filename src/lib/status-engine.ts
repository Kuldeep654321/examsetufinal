import { EventStatus, OppStatus } from '@/types';

/**
 * Dynamic Status Calculation Engine
 * Computes real-time status strictly based on official dates and current date.
 */
export function computeEventStatus(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isExtended = false,
  explicitStatus?: EventStatus
): EventStatus {
  // 1. If explicit status is unannounced or dates are null
  if (!startDate && !endDate) {
    return 'unannounced';
  }

  // If explicit status is delayed
  if (explicitStatus === 'delayed') {
    return 'delayed';
  }

  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);

  const start = startDate ? startDate.substring(0, 10) : null;
  const end = endDate ? endDate.substring(0, 10) : null;

  if (end && todayStr > end) {
    return 'completed'; // or 'closed'
  }

  if (start && todayStr < start) {
    return 'upcoming';
  }

  if (end) {
    // Check if closing soon (within 3 days of deadline)
    const endDateObj = new Date(end);
    const diffTime = endDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 3) {
      return 'closing_soon';
    }
  }

  if ((start && todayStr >= start) || (!start && end && todayStr <= end)) {
    return 'open';
  }

  return 'upcoming';
}

/**
 * Opportunity status calculator
 */
export function computeOpportunityStatus(
  start: string | null | undefined,
  deadline: string | null | undefined,
  isExtended = false
): OppStatus {
  if (!deadline && !start) {
    return 'upcoming';
  }

  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);

  const startStr = start ? start.substring(0, 10) : null;
  const endStr = deadline ? deadline.substring(0, 10) : null;

  if (endStr && todayStr > endStr) {
    return 'closed';
  }

  if (startStr && todayStr < startStr) {
    return 'upcoming';
  }

  if (endStr) {
    const endObj = new Date(endStr);
    const diffDays = Math.ceil((endObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 3) {
      return 'closing_soon';
    }
  }

  return 'open';
}
