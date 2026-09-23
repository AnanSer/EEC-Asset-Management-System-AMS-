'use client';

import React from 'react';
import EECLogo from '@/components/brand/EECLogo';
import { ShieldCheck, Layers, Cpu, CheckCircle2 } from 'lucide-react';

export const AuthBranding: React.FC = () => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#052932] via-eec-primary to-[#0c4e5e] text-white overflow-hidden w-1/2 min-h-screen select-none">
      {/* Background Decorative Rings & Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-eec-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-eec-active/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      {/* Header / Brand Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 shadow-inner">
            <EECLogo size={40} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Ethiopian Engineering Corporation
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-eec-accent">
              የኢትዮጵያ ኢንጂነሪንግ ኮርፖሬሽን
            </p>
          </div>
        </div>
      </div>

      {/* Center Hero Message */}
      <div className="relative z-10 max-w-lg my-auto py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-eec-accent backdrop-blur-md mb-6">
          <Cpu size={14} />
          <span>Enterprise Asset Management System (EAMS)</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-white leading-snug">
          Centralized Governance & Unified Control for Enterprise Assets
        </h2>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed">
          Secure, role-based platform empowering EEC departments to manage hardware, lifecycle assignments, maintenance tickets, and corporate assets across Ethiopia.
        </p>

        {/* Feature List */}
        <div className="mt-8 space-y-3.5">
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={15} />
            </div>
            <span>Departmental inventory & custody tracking</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-eec-accent/20 text-eec-accent flex items-center justify-center">
              <Layers size={15} />
            </div>
            <span>Preventive maintenance & testing workflows</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck size={15} />
            </div>
            <span>Verified identity & administrative approval gates</span>
          </div>
        </div>
      </div>

      {/* Footer / Copyright & Security note */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span>© {new Date().getFullYear()} EEC. All rights reserved.</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck size={14} className="text-emerald-400" /> ICT Directorate Secure Portal
        </span>
      </div>
    </div>
  );
};

export default AuthBranding;
