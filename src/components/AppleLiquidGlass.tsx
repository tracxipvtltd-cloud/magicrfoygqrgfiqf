import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'emerald' | 'dark' | 'glass';
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'light',
  className = '',
  onClick,
  ...props
}) => {
  let styleClasses = '';
  if (variant === 'light') {
    styleClasses = 'bg-white/95 dark:bg-slate-900/90 text-slate-950 dark:text-slate-100 backdrop-blur-xl border border-emerald-100 dark:border-emerald-950/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]';
  } else if (variant === 'emerald') {
    styleClasses = 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white backdrop-blur-xl border border-emerald-400/40 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.4)]';
  } else if (variant === 'dark') {
    styleClasses = 'bg-slate-900/95 backdrop-blur-2xl border border-emerald-900/40 text-white shadow-2xl';
  } else {
    styleClasses = 'bg-white/90 dark:bg-slate-900/70 text-slate-950 dark:text-white backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-xs';
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl transition-all duration-200 relative overflow-hidden ${styleClasses} ${className}`}
      {...props}
    >
      {/* Specular highlight glare */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  ...props
}) => {
  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses = 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_8px_25px_-4px_rgba(16,185,129,0.45)] border border-emerald-400/40 active:bg-emerald-700 font-black';
  } else if (variant === 'secondary') {
    variantClasses = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-extrabold';
  } else if (variant === 'glass') {
    variantClasses = 'bg-white/85 dark:bg-slate-800/80 hover:bg-white text-slate-950 dark:text-white backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm font-extrabold';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent hover:bg-emerald-500/10 text-slate-900 dark:text-slate-200 font-bold';
  } else if (variant === 'danger') {
    variantClasses = 'bg-red-500 hover:bg-red-400 text-white shadow-[0_8px_20px_-4px_rgba(239,68,68,0.4)] border border-red-300/40 font-black';
  }

  let sizeClasses = '';
  if (size === 'sm') sizeClasses = 'px-3 py-1.5 text-xs font-bold rounded-xl';
  else if (size === 'md') sizeClasses = 'px-5 py-3 text-sm font-extrabold rounded-2xl';
  else if (size === 'lg') sizeClasses = 'px-6 py-4 text-base font-black rounded-3xl';

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center font-sans tracking-wide cursor-pointer transition-colors duration-150 select-none overflow-hidden ${variantClasses} ${sizeClasses} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {/* Specular light sheen */}
      <span className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-2xl" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export const GlassPill: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'green' | 'amber' | 'neutral';
  className?: string;
}> = ({ children, icon, variant = 'neutral', className = '' }) => {
  let color = 'bg-white/90 dark:bg-slate-800/80 text-slate-950 dark:text-slate-200 border-slate-200 dark:border-white/10';
  if (variant === 'green') {
    color = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  } else if (variant === 'amber') {
    color = 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-tight backdrop-blur-md border shadow-xs ${color} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
};
