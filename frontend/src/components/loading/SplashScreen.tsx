'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import TypingText from './TypingText';
import ProgressLoader from './ProgressLoader';
import { useSystemSettings } from '@/hooks/useSystemSettings';

export type SplashPhase =
  | 'BOOTING'
  | 'TYPING_ORGANIZATION'
  | 'TYPING_SYSTEM'
  | 'LOADING'
  | 'COMPLETE'
  | 'FADE_OUT';

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [phase, setPhase] = useState<SplashPhase>('BOOTING');
  const [progress, setProgress] = useState(0);

  // Retrieve cached system settings for logo if available
  const { branding } = useSystemSettings();
  const logoSrc = branding?.logoUrl || '/branding/eec-logo.png';
  const orgName = 'Ethiopian Engineering Corporation';
  const systemName = 'Enterprise Asset Management System';

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Check sessionStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyShown = sessionStorage.getItem('eec_splash_shown');
      if (alreadyShown === 'true') {
        return;
      }
      setShouldRender(true);
    }
  }, []);

  // Coordinated progress advancement tied to lifecycle phase
  useEffect(() => {
    if (!shouldRender) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Define maximum progress ceiling per lifecycle phase
        let ceiling = 20;
        if (phase === 'TYPING_ORGANIZATION') {
          ceiling = 48;
        } else if (phase === 'TYPING_SYSTEM') {
          // Strictly hold below 72% until second typing sequence finishes
          ceiling = 70;
        } else if (phase === 'LOADING' || phase === 'COMPLETE' || phase === 'FADE_OUT') {
          ceiling = 100;
        }

        if (prev < ceiling) {
          // Move faster during the final loading surge (70 -> 100)
          const increment = phase === 'LOADING' ? 2 : 1;
          return Math.min(ceiling, prev + increment);
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [shouldRender, phase]);

  // Phase transition: BOOTING -> TYPING_ORGANIZATION
  useEffect(() => {
    if (!shouldRender || phase !== 'BOOTING') return;

    const timer = setTimeout(() => {
      setPhase('TYPING_ORGANIZATION');
    }, 150);

    return () => clearTimeout(timer);
  }, [shouldRender, phase]);

  // Phase transition: LOADING complete (progress hits 100%) -> COMPLETE
  useEffect(() => {
    if (!shouldRender || phase !== 'LOADING') return;

    if (progress >= 100) {
      setPhase('COMPLETE');
    }
  }, [shouldRender, phase, progress]);

  // Phase transition: COMPLETE -> broadcast completion, hold for 220ms -> FADE_OUT
  useEffect(() => {
    if (!shouldRender || phase !== 'COMPLETE') return;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eec_splash_shown', 'true');
      window.dispatchEvent(new CustomEvent('eec-splash-completed'));
    }

    if (onCompleteRef.current) {
      onCompleteRef.current();
    }

    const holdTimer = setTimeout(() => {
      setPhase('FADE_OUT');
    }, 220);

    return () => clearTimeout(holdTimer);
  }, [shouldRender, phase]);

  // Phase transition: FADE_OUT -> unmount after transition completes
  useEffect(() => {
    if (!shouldRender || phase !== 'FADE_OUT') return;

    const unmountTimer = setTimeout(() => {
      setShouldRender(false);
    }, 500);

    return () => clearTimeout(unmountTimer);
  }, [shouldRender, phase]);

  // Global safety watchdog: guarantee splash finishes and fades out within 3.6s
  useEffect(() => {
    if (!shouldRender) return;

    const watchdog = setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('eec_splash_shown', 'true');
        window.dispatchEvent(new CustomEvent('eec-splash-completed'));
      }
      setPhase('FADE_OUT');
      setTimeout(() => {
        setShouldRender(false);
      }, 500);
    }, 3600);

    return () => clearTimeout(watchdog);
  }, [shouldRender]);

  if (!shouldRender) {
    return null;
  }

  const isFadingOut = phase === 'FADE_OUT';

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100000] flex flex-col items-center justify-center p-6 bg-[#052831] text-white transition-opacity duration-500 ease-in-out select-none',
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at center, rgba(0, 167, 214, 0.15) 0%, rgba(5, 40, 49, 1) 75%)',
      }}
      aria-label="Application splash screen"
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-6">
        {/* EEC Logo with subtle cyan backlight */}
        <div className="relative group">
          <div className="absolute -inset-3 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/20 shadow-2xl flex items-center justify-center">
            <Image
              src={logoSrc}
              alt="Ethiopian Engineering Corporation"
              width={100}
              height={100}
              priority
              className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Corporate Titles with Sequential Synchronized Typing */}
        <div className="space-y-1.5 min-h-[72px] flex flex-col items-center justify-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white min-h-[32px]">
            {phase === 'BOOTING' ? null : (
              <TypingText
                text={orgName}
                speed={20}
                active
                showCursor={phase === 'TYPING_ORGANIZATION'}
                onComplete={() => {
                  setPhase('TYPING_SYSTEM');
                }}
              />
            )}
          </h1>

          <h2 className="text-xs sm:text-sm font-medium tracking-wide text-cyan-300 min-h-[22px]">
            {phase === 'BOOTING' || phase === 'TYPING_ORGANIZATION' ? null : (
              <TypingText
                text={systemName}
                speed={18}
                active
                showCursor={phase === 'TYPING_SYSTEM'}
                onComplete={() => {
                  // Typing completed! Now allow progress to surge to 100%
                  setPhase('LOADING');
                }}
              />
            )}
          </h2>
        </div>

        {/* Glowing Progress Loader */}
        <div className="w-full max-w-xs sm:max-w-sm pt-4">
          <ProgressLoader
            progress={progress}
            footerMessage={
              phase === 'BOOTING'
                ? 'Connecting to EEC Infrastructure...'
                : phase === 'TYPING_ORGANIZATION' || phase === 'TYPING_SYSTEM'
                ? 'Authenticating Enterprise Assets...'
                : phase === 'LOADING'
                ? 'Finalizing Environment...'
                : 'Ready'
            }
          />
        </div>
      </div>
    </div>
  );
}
