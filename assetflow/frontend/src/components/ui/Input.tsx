import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-surface-700">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full rounded-xl border border-surface-300 py-2.5 px-3 bg-white text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-200",
              {
                'pl-10': icon,
                'border-red-500 focus:ring-red-500 focus:border-red-500': error,
              },
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-500 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
