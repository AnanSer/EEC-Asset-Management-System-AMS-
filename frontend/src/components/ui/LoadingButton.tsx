'use client';

import React from 'react';
import { Loader2, Check } from 'lucide-react';
import clsx from 'clsx';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'danger'
  | 'ghost'
  | 'success'
  | 'warning';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: React.ReactNode;
  isSuccess?: boolean;
  successText?: React.ReactNode;
  icon?: React.ReactNode | React.ElementType;
  iconPlacement?: 'left' | 'right';
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-eec-primary hover:bg-[#062f3a] active:bg-[#04242d] text-white shadow-xs focus-visible:ring-eec-primary/30',
  secondary:
    'bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white shadow-xs focus-visible:ring-slate-400/30',
  accent:
    'bg-[#00A7D6] hover:bg-[#0092bc] active:bg-[#007da1] text-white shadow-xs focus-visible:ring-cyan-400/30',
  outline:
    'border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-2xs focus-visible:ring-slate-300/40',
  danger:
    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus-visible:ring-rose-500/30',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-300/30',
  success:
    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500/30',
  warning:
    'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs focus-visible:ring-amber-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs font-semibold gap-1.5 rounded-lg',
  md: 'px-3.5 py-2 text-xs font-semibold gap-2 rounded-lg',
  lg: 'px-4 py-2.5 text-sm font-semibold gap-2 rounded-xl',
};

export default function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  isSuccess = false,
  successText,
  icon,
  iconPlacement = 'left',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled,
  className,
  onClick,
  type = 'button',
  ...rest
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const renderIcon = (iconItem?: React.ReactNode | React.ElementType) => {
    if (!iconItem) return null;
    if (React.isValidElement(iconItem)) {
      return iconItem;
    }
    const Comp = iconItem as React.ElementType;
    return <Comp className="w-4 h-4 shrink-0" />;
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      aria-busy={isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        isSuccess && 'bg-emerald-600 text-white hover:bg-emerald-600',
        className
      )}
      {...rest}
    >
      {/* Loading Spinner */}
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : isSuccess ? (
        <Check className="w-4 h-4 shrink-0 text-white" />
      ) : (
        iconPlacement === 'left' && renderIcon(icon)
      )}

      {/* Button Content / Text */}
      {children && (
        <span>
          {isLoading
            ? loadingText ?? children
            : isSuccess
            ? successText ?? children
            : children}
        </span>
      )}

      {/* Right Icon when not loading */}
      {!isLoading && !isSuccess && iconPlacement === 'right' && renderIcon(icon)}
    </button>
  );
}
