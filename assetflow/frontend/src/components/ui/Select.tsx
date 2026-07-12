import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-surface-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-surface-300 py-2.5 px-3 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-200 cursor-pointer",
            {
              'border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-red-500 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
