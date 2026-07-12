import React from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-surface-200 border-dashed max-w-lg mx-auto my-6 animate-fade-in",
        className
      )}
    >
      {icon ? (
        <div className="text-surface-400 mb-4">{icon}</div>
      ) : (
        <div className="h-16 w-16 bg-surface-50 text-surface-400 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-bold text-surface-900">{title}</h3>
      <p className="mt-1 text-sm text-surface-500 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
