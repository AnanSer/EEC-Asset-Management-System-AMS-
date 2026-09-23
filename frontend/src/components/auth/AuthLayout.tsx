'use client';

import React from 'react';
import AuthBranding from './AuthBranding';
import EECLogo from '@/components/brand/EECLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Left Side Branding */}
      <AuthBranding />

      {/* Right Side / Main Interactive Auth Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Mobile Header (Hidden on LG screens) */}
        <div className="lg:hidden flex items-center gap-3 mb-8 text-center">
          <div className="p-2 bg-eec-primary rounded-xl shadow-md">
            <EECLogo size={32} />
          </div>
          <div className="text-left">
            <h1 className="text-base font-bold text-eec-primary leading-tight">
              Ethiopian Engineering Corporation
            </h1>
            <p className="text-[10px] font-semibold text-eec-accent tracking-wider uppercase">
              EAMS Portal
            </p>
          </div>
        </div>

        {/* Auth Content Card */}
        <div className="w-full flex justify-center">{children}</div>

        {/* Mobile / Screen-bottom subtle copyright */}
        <p className="mt-8 text-xs text-slate-400 text-center lg:hidden">
          © {new Date().getFullYear()} Ethiopian Engineering Corporation. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
