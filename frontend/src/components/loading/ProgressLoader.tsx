'use client';

import React from 'react';
import clsx from 'clsx';

interface ProgressLoaderProps {
  progress: number; // 0 to 100
  footerMessage?: string;
  className?: string;
}

export default function ProgressLoader({
  progress,
  footerMessage = 'Initializing Enterprise Services...',
  className,
}: ProgressLoaderProps) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={clsx('w-full max-w-md mx-auto space-y-3 text-center', className)}>
      {/* Outer Glow Progress Container */}
      <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,167,214,0.15)]">
        {/* Progress Bar Fill with Glow */}
        <div
          className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-[#00A7D6] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(0,167,214,0.8)] relative"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Subtle moving shimmer highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Percentage Counter and Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span className="text-cyan-300 font-semibold">{footerMessage}</span>
        <span className="text-cyan-400 font-bold">{clampedProgress}%</span>
      </div>
    </div>
  );
}
