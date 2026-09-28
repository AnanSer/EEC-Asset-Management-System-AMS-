'use client';

import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface LogoPreloaderProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function LogoPreloader({
  message,
  className,
  fullScreen = true,
}: LogoPreloaderProps) {
  const { branding } = useSystemSettings();
  const logoSrc = branding?.logoUrl || '/branding/eec-logo.png';
  const orgName = branding?.organizationName || 'Ethiopian Engineering Corporation';
  const systemName = 'Enterprise Asset Management System';

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-6 bg-[#052831] text-white select-none transition-all duration-300',
        fullScreen ? 'fixed inset-0 z-[99999]' : 'w-full h-full min-h-[300px]',
        className
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at center, rgba(0, 167, 214, 0.15) 0%, rgba(5, 40, 49, 1) 75%)',
      }}
      aria-label="Loading..."
    >
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-5 animate-in fade-in duration-300">
        {/* EEC Logo with subtle cyan glow */}
        <div className="relative group">
          <div className="absolute -inset-3 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/20 shadow-2xl flex items-center justify-center">
            <Image
              src={logoSrc}
              alt={orgName}
              width={88}
              height={88}
              priority
              className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Corporate Titles */}
        <div className="space-y-1">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
            {orgName}
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-wide text-cyan-300">
            {systemName}
          </p>
        </div>

        {/* Elegant Cyan Spinner */}
        <div className="flex flex-col items-center space-y-3 pt-1">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_12px_rgba(0,167,214,0.5)]" />
          </div>

          {message && (
            <p className="text-xs text-cyan-200/80 font-medium tracking-wide animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
