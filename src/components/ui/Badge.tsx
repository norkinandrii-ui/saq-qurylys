import clsx from 'clsx';
import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'green' | 'yellow' | 'red' | 'gray' | 'blue', className?: string }> = ({ children, variant = 'gray', className }) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const colors = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-slate-100 text-slate-800",
    blue: "bg-blue-100 text-blue-800"
  };
  return <span className={clsx(base, colors[variant], className)}>{children}</span>;
}
