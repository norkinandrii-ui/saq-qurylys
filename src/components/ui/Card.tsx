import React from 'react';
import clsx from 'clsx';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={clsx("bg-white overflow-hidden shadow rounded-lg border border-slate-200", className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={clsx("px-4 py-5 sm:px-6 border-b border-slate-200", className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={clsx("px-4 py-5 sm:p-6", className)}>
    {children}
  </div>
);
