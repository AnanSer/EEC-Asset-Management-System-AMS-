import React from 'react';

interface EECLogoProps {
  size?: number;
  className?: string;
}

export default function EECLogo({ size = 36, className = '' }: EECLogoProps) {
  return (
    <img
      src="/branding/logo-mark.png"
      width={size}
      height={size}
      alt="Ethiopian Engineering Corporation"
      className={`object-contain flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

