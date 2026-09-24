'use client';

import React from 'react';
import Image from 'next/image';
import AuthBranding from './AuthBranding';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { branding } = useSystemSettings();

  return (
    <div className="flex min-h-screen bg-slate-50/80">
      {/* Desktop Left Side Branding */}
      <AuthBranding />

      {/* Right Side / Main Interactive Auth Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto min-h-screen">
        {/* Mobile Header (Hidden on LG screens) */}
        <div className="lg:hidden flex flex-col items-center gap-2.5 mb-8 text-center">
          <div className="p-3 bg-eec-primary rounded-xl shadow-sm flex items-center justify-center">
            <Image
              src="/branding/logo.png"
              alt={branding.organizationName}
              width={180}
              height={71}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 font-sans">
              የኢትዮጵያ ኢንጂነሪንግ ኮርፖሬሽን
            </p>
            <p className="text-[10px] font-mono font-semibold text-cyan-700 tracking-wider uppercase mt-0.5">
              Enterprise Asset Management Portal
            </p>
          </div>
        </div>

        {/* Auth Content Card */}
        <div className="w-full flex justify-center">{children}</div>

        {/* Mobile / Screen-bottom subtle copyright */}
        <p className="mt-8 text-xs text-slate-400 text-center lg:hidden">
          © {new Date().getFullYear()} {branding.organizationName}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
