'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { AssetCategory, ASSET_CATEGORY_LABELS } from '@/constants/assets';

export const ASSET_CATEGORY_THUMBNAILS: Record<string, string> = {
  LAPTOP: '/assets/placeholders/laptop.svg',
  DESKTOP: '/assets/placeholders/desktop.svg',
  PRINTER: '/assets/placeholders/printer.svg',
  SCANNER: '/assets/placeholders/scanner.svg',
  ROUTER: '/assets/placeholders/router.svg',
  SWITCH: '/assets/placeholders/switch.svg',
  PROJECTOR: '/assets/placeholders/projector.svg',
  MONITOR: '/assets/placeholders/monitor.svg',
  SERVER: '/assets/placeholders/server.svg',
  UPS: '/assets/placeholders/ups.svg',
  OTHER: '/assets/placeholders/other.svg',
};

export function getAssetCategoryThumbnail(category?: string | null): string {
  if (!category) return '/assets/placeholders/other.svg';
  const upper = category.toUpperCase();
  return ASSET_CATEGORY_THUMBNAILS[upper] || '/assets/placeholders/other.svg';
}

interface AssetThumbnailProps {
  category?: AssetCategory | string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7 rounded-md p-0.5',
  sm: 'w-9 h-9 rounded-lg p-1',
  md: 'w-12 h-12 rounded-xl p-1.5',
  lg: 'w-16 h-16 rounded-2xl p-2',
  xl: 'w-20 h-20 rounded-2xl p-2.5',
};

const dimensionMap = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 80,
};

export default function AssetThumbnail({
  category,
  alt,
  size = 'md',
  className = '',
}: AssetThumbnailProps) {
  const [error, setError] = useState(false);
  const catKey = (category || 'OTHER').toUpperCase();
  const src = getAssetCategoryThumbnail(catKey);
  const label = ASSET_CATEGORY_LABELS[catKey as AssetCategory] ?? 'Asset';
  const dim = dimensionMap[size];

  if (error) {
    return (
      <div
        className={`bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
      >
        <Package className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      <Image
        src={src}
        alt={alt || `${label} thumbnail`}
        width={dim}
        height={dim}
        className="w-full h-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
}
