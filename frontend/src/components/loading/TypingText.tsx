'use client';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  active?: boolean;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
}

export default function TypingText({
  text,
  speed = 22,
  delay = 0,
  active = true,
  onComplete,
  className,
  showCursor = true,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setDisplayedText('');
      setIsTyping(false);
      setIsCompleted(false);
      return;
    }

    if (isCompleted) {
      setDisplayedText(text);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
          setIsCompleted(true);
          onCompleteRef.current?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, delay, active, isCompleted]);

  return (
    <span className={clsx('inline-block', className)}>
      {displayedText}
      {showCursor && isTyping && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400 animate-pulse align-middle" />
      )}
    </span>
  );
}
