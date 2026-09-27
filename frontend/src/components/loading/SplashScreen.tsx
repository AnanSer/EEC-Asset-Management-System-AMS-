'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import TypingText from './TypingText';
import ProgressLoader from './ProgressLoader';

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    if (typeof window !== 'undefined') {
      const alreadyShown = sessionStorage.getItem('eec_splash_shown');
      if (alreadyShown === 'true') {
        return;
      }
      setShouldRender(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    // Smoothly increment progress from 0 to 100%
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds total preloader duration

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const fraction = Math.min(1, elapsed / duration);
      // Ease-out cubic curve
      const eased = 1 - Math.pow(1 - fraction, 3);
      const currentVal = Math.round(eased * 100);

      setProgress(currentVal);

      if (fraction >= 1) {
        clearInterval(timer);
        // Begin fade out after hitting 100%
        setTimeout(() => {
          setIsFadingOut(true);
          sessionStorage.setItem('eec_splash_shown', 'true');
          setTimeout(() => {
            setShouldRender(false);
            if (onComplete) onComplete();
          }, 500);
        }, 200);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [shouldRender, onComplete]);

  if (!shouldRender) {
    return null;
  }

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
        {/* EEC Logo with subtle pulse & backlight */}
        <div className="relative group">
          <div className="absolute -inset-3 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/20 shadow-2xl flex items-center justify-center">
            <Image
              src="/branding/eec-logo.png"
              alt="Ethiopian Engineering Corporation"
              width={100}
              height={100}
              priority
              className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Corporate Titles with Sequential Typing */}
        <div className="space-y-1.5 min-h-[72px] flex flex-col items-center justify-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white">
            <TypingText
              text="Ethiopian Engineering Corporation"
              speed={28}
              onComplete={() => setStep(2)}
            />
          </h1>

          <h2 className="text-xs sm:text-sm font-medium tracking-wide text-cyan-300">
            {step >= 2 && (
              <TypingText
                text="Enterprise Asset Management System"
                speed={24}
              />
            )}
          </h2>
        </div>

        {/* Glowing Progress Loader */}
        <div className="w-full max-w-xs sm:max-w-sm pt-4">
          <ProgressLoader
            progress={progress}
            footerMessage="Initializing Enterprise Services..."
          />
        </div>
      </div>
    </div>
  );
}
