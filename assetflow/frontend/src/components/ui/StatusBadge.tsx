import React from 'react';
import { cn } from '../../lib/utils';

const statusColors: Record<string, string> = {
  // Asset Status
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  ALLOCATED: 'bg-blue-100 text-blue-800',
  RESERVED: 'bg-amber-100 text-amber-800',
  UNDER_MAINTENANCE: 'bg-orange-100 text-orange-800',
  LOST: 'bg-red-100 text-red-800',
  RETIRED: 'bg-gray-100 text-gray-800',
  DISPOSED: 'bg-gray-200 text-gray-600',
  // Transfer/Maintenance Status
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  // Booking Status
  UPCOMING: 'bg-indigo-100 text-indigo-800',
  ONGOING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  // General
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = status.toUpperCase();
  const colorClass = statusColors[normalized] || 'bg-surface-100 text-surface-800';

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        colorClass,
        className
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default StatusBadge;
