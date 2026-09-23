'use client';

import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

export interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showChecklist?: boolean;
}

export function evaluatePasswordStrength(password: string) {
  const checks = {
    minLength: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumberOrSymbol: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label: 'Empty' | 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Empty';
  let color = 'bg-slate-200';
  let textColor = 'text-slate-400';
  let width = '0%';

  if (password.length > 0) {
    if (score <= 1) {
      label = 'Weak';
      color = 'bg-rose-500';
      textColor = 'text-rose-600';
      width = '25%';
    } else if (score === 2) {
      label = 'Fair';
      color = 'bg-amber-500';
      textColor = 'text-amber-600';
      width = '50%';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-sky-500';
      textColor = 'text-sky-600';
      width = '75%';
    } else {
      label = 'Strong';
      color = 'bg-emerald-500';
      textColor = 'text-emerald-600';
      width = '100%';
    }
  }

  return { checks, score, label, color, textColor, width };
}

export default function PasswordStrengthIndicator({
  password,
  className,
  showChecklist = true,
}: PasswordStrengthIndicatorProps) {
  const { checks, label, color, textColor, width } = useMemo(
    () => evaluatePasswordStrength(password),
    [password]
  );

  if (!password) {
    return null;
  }

  return (
    <div
      className={clsx(
        'p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-2.5 transition-all animate-in fade-in',
        className
      )}
    >
      {/* Strength Header & Progress Bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">Password Strength:</span>
        <span className={clsx('font-bold transition-colors', textColor)}>{label}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={clsx('h-full transition-all duration-300 ease-out', color)}
          style={{ width }}
        />
      </div>

      {/* Live Criteria Checklist */}
      {showChecklist && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600">
            {checks.minLength ? (
              <Check size={13} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <X size={13} className="text-slate-400 flex-shrink-0" />
            )}
            <span className={checks.minLength ? 'text-slate-900 font-medium' : 'text-slate-500'}>
              8+ characters
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            {checks.hasUpper ? (
              <Check size={13} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <X size={13} className="text-slate-400 flex-shrink-0" />
            )}
            <span className={checks.hasUpper ? 'text-slate-900 font-medium' : 'text-slate-500'}>
              Uppercase letter
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            {checks.hasLower ? (
              <Check size={13} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <X size={13} className="text-slate-400 flex-shrink-0" />
            )}
            <span className={checks.hasLower ? 'text-slate-900 font-medium' : 'text-slate-500'}>
              Lowercase letter
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            {checks.hasNumberOrSymbol ? (
              <Check size={13} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <X size={13} className="text-slate-400 flex-shrink-0" />
            )}
            <span className={checks.hasNumberOrSymbol ? 'text-slate-900 font-medium' : 'text-slate-500'}>
              Number or symbol
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
