'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LoadingButton from '@/components/ui/LoadingButton';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Wrench,
  FlaskConical,
  UserCheck,
  ShieldAlert,
  Trash2,
  Check,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';
import { NotificationItemData, NotificationType } from '@/services/notification.service';
import { formatEnterpriseRelativeTime } from '@/utils/notification.utils';

interface NotificationItemProps {
  notification: NotificationItemData;
  onMarkRead?: (id: string, e?: React.MouseEvent) => void;
  onDelete?: (id: string, e?: React.MouseEvent) => void;
  onClick?: (notification: NotificationItemData) => void;
  compact?: boolean;
  timeZone?: string;
}

const typeConfig: Record<
  NotificationType,
  {
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  SUCCESS: {
    icon: CheckCircle2,
    bgClass: 'bg-emerald-50 text-emerald-600',
    textClass: 'text-emerald-700',
    borderClass: 'border-l-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  WARNING: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-50 text-amber-600',
    textClass: 'text-amber-700',
    borderClass: 'border-l-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  ERROR: {
    icon: AlertCircle,
    bgClass: 'bg-rose-50 text-rose-600',
    textClass: 'text-rose-700',
    borderClass: 'border-l-rose-500',
    badgeClass: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  INFO: {
    icon: Info,
    bgClass: 'bg-blue-50 text-blue-600',
    textClass: 'text-blue-700',
    borderClass: 'border-l-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  MAINTENANCE: {
    icon: Wrench,
    bgClass: 'bg-cyan-50 text-cyan-600',
    textClass: 'text-cyan-700',
    borderClass: 'border-l-cyan-500',
    badgeClass: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  },
  TESTING: {
    icon: FlaskConical,
    bgClass: 'bg-purple-50 text-purple-600',
    textClass: 'text-purple-700',
    borderClass: 'border-l-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 ring-purple-200',
  },
  ACCOUNT: {
    icon: UserCheck,
    bgClass: 'bg-indigo-50 text-indigo-600',
    textClass: 'text-indigo-700',
    borderClass: 'border-l-indigo-500',
    badgeClass: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
  WARRANTY: {
    icon: ShieldAlert,
    bgClass: 'bg-orange-50 text-orange-600',
    textClass: 'text-orange-700',
    borderClass: 'border-l-orange-500',
    badgeClass: 'bg-orange-50 text-orange-700 ring-orange-200',
  },
};

export function formatRelativeTime(
  dateString: string,
  timeZone: string = 'Africa/Addis_Ababa'
): string {
  return formatEnterpriseRelativeTime(dateString, timeZone);
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClick,
  compact = false,
  timeZone = 'Africa/Addis_Ababa',
}: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.INFO;
  const IconComponent = config.icon;
  const isUnread = !notification.isRead;

  const [isMarking, setIsMarking] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    } else if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkRead) {
      setIsMarking(true);
      try {
        await onMarkRead(notification.id, e);
      } finally {
        setIsMarking(false);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id, e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'group relative flex items-start gap-3 transition-all duration-150 cursor-pointer',
        compact ? 'p-3.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0' : 'p-4 rounded-xl border border-slate-200/80 hover:shadow-xs hover:border-slate-300',
        isUnread
          ? clsx('bg-slate-50/70 border-l-4', config.borderClass)
          : 'bg-white border-l-slate-200'
      )}
    >
      {/* Type Icon */}
      <div
        className={clsx(
          'shrink-0 rounded-xl flex items-center justify-center transition-colors',
          compact ? 'w-8 h-8 p-1.5' : 'w-10 h-10 p-2.5',
          config.bgClass
        )}
      >
        <IconComponent className={clsx(compact ? 'w-4 h-4' : 'w-5 h-5')} />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <h4
            className={clsx(
              'text-xs font-semibold leading-snug truncate',
              isUnread ? 'text-slate-900 font-bold' : 'text-slate-700'
            )}
            title={notification.title}
          >
            {notification.title}
          </h4>

          {/* Type Badge (Only in full mode) */}
          {!compact && (
            <span
              className={clsx(
                'inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wider',
                config.badgeClass
              )}
            >
              {notification.type}
            </span>
          )}

          {/* Unread indicator dot */}
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-eec-primary shrink-0 animate-pulse" />
          )}
        </div>

        <p
          className={clsx(
            'text-xs text-slate-600 leading-relaxed',
            compact ? 'line-clamp-2' : 'line-clamp-3'
          )}
        >
          {notification.message}
        </p>

        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[11px] text-slate-400 font-medium">
            {formatRelativeTime(notification.createdAt, timeZone)}
          </span>

          {notification.link && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-eec-primary hover:underline">
              <span>View details</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Actions (Mark Read & Delete) */}
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && onMarkRead && (
          <LoadingButton
            type="button"
            onClick={handleMarkRead}
            isLoading={isMarking}
            variant="ghost"
            size="sm"
            className="!p-1 text-slate-400 hover:text-eec-primary hover:bg-slate-200/60"
            icon={<Check className="w-3.5 h-3.5" />}
            title="Mark as read"
            aria-label="Mark notification as read"
          />
        )}

        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete notification"
            aria-label="Delete notification"
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
