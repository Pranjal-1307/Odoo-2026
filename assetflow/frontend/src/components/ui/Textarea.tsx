import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-surface-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            "w-full rounded-xl border border-surface-300 py-2.5 px-3 bg-white text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-200 resize-none",
            {
              'border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
