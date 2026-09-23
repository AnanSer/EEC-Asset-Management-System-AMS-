'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

export type UserAvatarSize = 'sm' | 'md' | 'lg';

export interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: UserAvatarSize;
  className?: string;
  alt?: string;
}

const sizeMap: Record<UserAvatarSize, { container: string; text: string }> = {
  sm: {
    container: 'w-7 h-7 rounded-full',
    text: 'text-xs font-bold',
  },
  md: {
    container: 'w-10 h-10 rounded-xl',
    text: 'text-sm font-bold',
  },
  lg: {
    container: 'w-24 h-24 rounded-2xl ring-4 ring-eec-primary/10 shadow-md',
    text: 'text-3xl font-bold',
  },
};

export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const prefix = email.split('@')[0];
    return prefix.slice(0, 2).toUpperCase();
  }
  return 'U';
}

export function UserAvatar({
  name,
  email,
  image,
  size = 'md',
  className,
  alt,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name, email);
  const { container, text } = sizeMap[size] || sizeMap.md;

  if (image && !imageError) {
    return (
      <div
        className={clsx(
          'relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-100 select-none',
          container,
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={alt || name || 'User Avatar'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center flex-shrink-0 bg-eec-primary text-white select-none',
        container,
        text,
        className
      )}
      aria-label={name || email || 'User Avatar'}
    >
      {initials}
    </div>
  );
}

export default UserAvatar;
