import clsx from 'clsx';
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' }> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const base = "inline-flex items-center justify-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors";
  
  const variants = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border-transparent text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    outline: "border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-blue-500",
    ghost: "border-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500 shadow-none"
  };
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
