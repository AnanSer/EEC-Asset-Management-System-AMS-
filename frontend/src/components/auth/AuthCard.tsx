'use client';

import React from 'react';
import clsx from 'clsx';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  footer,
  className,
}) => {
  return (
    <div
      className={clsx(
        'w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 transition-all',
        className
      )}
    >
      {/* Header */}
      <div className="text-center mb-7">
        {icon && (
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-eec-background text-eec-primary mb-4 shadow-sm border border-slate-100">
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Main Form/Content */}
      <div>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs sm:text-sm text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AuthCard;
