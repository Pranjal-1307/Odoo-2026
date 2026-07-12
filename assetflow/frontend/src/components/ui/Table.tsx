import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-surface-200 bg-white">
      <table className={cn("w-full text-sm border-collapse text-left", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-surface-50 border-b border-surface-200 text-surface-700 font-semibold", className)} {...props} />
  );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-surface-100", className)} {...props} />
  );
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-surface-50/50 transition duration-150", className)} {...props} />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-6 py-4 text-surface-600 align-middle", className)} {...props} />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-6 py-3 font-semibold text-surface-700 align-middle", className)} {...props} />
  );
}
export default Table;
