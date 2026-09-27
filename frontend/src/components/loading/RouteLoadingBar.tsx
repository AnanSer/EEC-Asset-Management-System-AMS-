'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = () => {
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);

    setVisible(true);
    setProgress(15);

    // Smooth trickling progress
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        const step = Math.max(1, (85 - prev) * 0.15);
        return Math.min(85, prev + step);
      });
    }, 200);
  };

  const completeLoading = () => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);

    setProgress(100);

    completeTimerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 300);
    }, 200);
  };

  // Complete loading when pathname or searchParams change
  useEffect(() => {
    completeLoading();
  }, [pathname, searchParams]);

  // Intercept internal link clicks to start loading immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external links, new tabs, anchors, and downloads
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        targetAttr === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // If navigating to different path
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        startLoading();
      }
    };

    // Custom API event listeners
    const handleApiStart = () => startLoading();
    const handleApiStop = () => completeLoading();

    document.addEventListener('click', handleAnchorClick, true);
    window.addEventListener('eec-loading-start', handleApiStart);
    window.addEventListener('eec-loading-stop', handleApiStop);

    return () => {
      document.removeEventListener('click', handleAnchorClick, true);
      window.removeEventListener('eec-loading-start', handleApiStart);
      window.removeEventListener('eec-loading-stop', handleApiStop);
      if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[#00A7D6] shadow-[0_0_10px_#00A7D6,0_0_5px_#00A7D6] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
