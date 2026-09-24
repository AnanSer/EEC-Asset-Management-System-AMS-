'use client';

import React from 'react';
import Image from 'next/image';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import {
  Boxes,
  ArrowLeftRight,
  Wrench,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const AuthBranding: React.FC = () => {
  const { branding } = useSystemSettings();

  return (
    <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-[#062C43] text-white overflow-hidden w-1/2 min-h-screen select-none border-r border-slate-800">
      {/* Right-Half: EEC Headquarters Building + Subtle Microsoft Fabric-inspired Curved Overlays */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none overflow-hidden select-none">
        {/* Subtle curved blue overlay shapes behind the building for depth */}
        <svg
          className="absolute -right-10 -top-10 w-[130%] h-[120%] opacity-20"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M150,600 C300,480 440,360 480,180 C510,30 420,-60 320,-120 L600,-120 L600,600 Z"
            fill="url(#fabric-curve-1)"
          />
          <path
            d="M50,600 C200,450 350,320 400,140 C440,-20 340,-120 260,-180 L600,-180 L600,600 Z"
            fill="url(#fabric-curve-2)"
            opacity="0.7"
          />
          <defs>
            <linearGradient id="fabric-curve-1" x1="150" y1="600" x2="600" y2="-100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5C6" />
              <stop offset="1" stopColor="#062C43" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fabric-curve-2" x1="50" y1="600" x2="500" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E40AF" />
              <stop offset="1" stopColor="#0EA5C6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Sharp and realistic EEC Headquarters Building Image */}
        <Image
          src="/branding/eec-headquarters.jpg"
          alt="Ethiopian Engineering Corporation Headquarters"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Soft navy-to-transparent gradient blend from left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#062C43] via-[#062C43]/70 to-transparent w-full h-full" />

        {/* Soft vertical fades to blend naturally at top and bottom */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#062C43] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#062C43] to-transparent" />
      </div>

      {/* Top-Left: EEC Logo and Corporation Name */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/branding/logo.png"
            alt={branding.organizationName || 'Ethiopian Engineering Corporation'}
            width={210}
            height={60}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </div>

      {/* Center Content: Headline, Description & 2x2 Feature Cards */}
      <div className="relative z-10 my-auto py-6 max-w-xl space-y-5">
        {/* Small Badge */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#0EA5C6]/15 border border-[#0EA5C6]/30 text-[#0EA5C6] text-[11px] sm:text-xs font-semibold tracking-wider uppercase leading-snug">
            ETHIOPIAN ENGINEERING CORPORATION ASSET MANAGEMENT SYSTEM (EEC EAMS)
          </span>
        </div>

        {/* Large Heading */}
        <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
          Smarter Asset Management for a Stronger EEC
        </h1>

        {/* Supporting Text */}
        <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
          A centralized platform to track, assign, transfer, and maintain engineering and IT assets across EEC departments and project sites.
        </p>

        {/* 2×2 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Feature 1 */}
          <div className="p-3.5 rounded-lg bg-[#062C43]/90 border border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded bg-[#0EA5C6]/15 flex items-center justify-center text-[#0EA5C6] flex-shrink-0">
                <Boxes size={16} />
              </div>
              <h3 className="text-xs xl:text-sm font-semibold text-white">Asset Tracking</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monitor company assets in one centralized system.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-3.5 rounded-lg bg-[#062C43]/90 border border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded bg-[#0EA5C6]/15 flex items-center justify-center text-[#0EA5C6] flex-shrink-0">
                <ArrowLeftRight size={16} />
              </div>
              <h3 className="text-xs xl:text-sm font-semibold text-white">Assignment &amp; Transfer</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assign and transfer assets between employees and departments.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-3.5 rounded-lg bg-[#062C43]/90 border border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded bg-[#0EA5C6]/15 flex items-center justify-center text-[#0EA5C6] flex-shrink-0">
                <Wrench size={16} />
              </div>
              <h3 className="text-xs xl:text-sm font-semibold text-white">Maintenance Management</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Schedule and monitor maintenance throughout the asset lifecycle.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-3.5 rounded-lg bg-[#062C43]/90 border border-slate-700/60 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded bg-[#0EA5C6]/15 flex items-center justify-center text-[#0EA5C6] flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-xs xl:text-sm font-semibold text-white">Security &amp; Compliance</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maintain audit history, warranties, and role-based access.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Strip: Three Small Icon Labels */}
      <div className="relative z-10 pt-5 border-t border-slate-700/60 flex items-center gap-8 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#0EA5C6]" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#0EA5C6]" />
          <span>Efficient</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#0EA5C6]" />
          <span>Reliable</span>
        </div>
      </div>
    </div>
  );
};

export default AuthBranding;
