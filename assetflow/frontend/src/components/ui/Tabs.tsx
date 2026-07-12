import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, className, ...props }: TabsProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const activeValue = controlledValue !== undefined ? controlledValue : localValue;

  const handleValueChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
    } else {
      setLocalValue(val);
    }
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-surface-100 p-1 text-surface-500",
        className
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        {
          'bg-white text-surface-900 shadow-sm font-semibold': isActive,
          'hover:text-surface-900': !isActive,
        },
        className
      )}
      {...props}
    />
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  const isActive = context.value === value;

  if (!isActive) return null;
  return (
    <div
      className={cn(
        "mt-4 focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}
export default Tabs;
