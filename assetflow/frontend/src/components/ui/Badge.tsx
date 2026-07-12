import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        {
          'bg-brand-600 text-white hover:bg-brand-700': variant === 'default',
          'bg-surface-100 text-surface-900 hover:bg-surface-200': variant === 'secondary',
          'bg-emerald-100 text-emerald-800': variant === 'success',
          'bg-amber-100 text-amber-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'destructive',
          'border border-surface-200 text-surface-900': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export default Badge;
