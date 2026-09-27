'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCheck,
  BellOff,
  ArrowRight,
  Trash2,
  Wrench,
  FlaskConical,
  UserCheck,
  ShieldAlert,
  Inbox,
} from 'lucide-react';
import clsx from 'clsx';
import NotificationItem from './NotificationItem';
import EmptyState from '@/components/ui/EmptyState';
import LoadingButton from '@/components/ui/LoadingButton';
import { NotificationItemData } from '@/services/notification.service';
import { groupNotifications } from '@/utils/notification.utils';

export type DropdownFilterType =
  | 'ALL'
  | 'UNREAD'
  | 'MAINTENANCE'
  | 'TESTING'
  | 'ACCOUNT'
  | 'WARRANTY';

interface FilterOption {
  id: DropdownFilterType;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'ALL', label: 'All' },
  { id: 'UNREAD', label: 'Unread' },
  { id: 'MAINTENANCE', label: 'Maintenance' },
  { id: 'TESTING', label: 'Testing' },
  { id: 'ACCOUNT', label: 'Account' },
  { id: 'WARRANTY', label: 'Warranty' },
];

interface NotificationDropdownProps {
  notifications: NotificationItemData[];
  unreadCount: number;
  isLoading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearRead: () => void;
  onClose: () => void;
  timeZone?: string;
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  isLoading,
  onMarkRead,
  onMarkAllAsRead,
  onDelete,
  onClearRead,
  onClose,
  timeZone = 'Africa/Addis_Ababa',
}: NotificationDropdownProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<DropdownFilterType>('ALL');
  const [isClearing, setIsClearing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Filter items in-memory for instant feedback
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'UNREAD':
        return notifications.filter((n) => !n.isRead);
      case 'MAINTENANCE':
        return notifications.filter((n) => n.type === 'MAINTENANCE');
      case 'TESTING':
        return notifications.filter((n) => n.type === 'TESTING');
      case 'ACCOUNT':
        return notifications.filter((n) => n.type === 'ACCOUNT');
      case 'WARRANTY':
        return notifications.filter((n) => n.type === 'WARRANTY');
      case 'ALL':
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  // Preview limit: Maximum 10 newest notifications
  const previewItems = useMemo(
    () => filteredNotifications.slice(0, 10),
    [filteredNotifications]
  );

  // Group notifications into: Today, Yesterday, Earlier This Week, Older
  const groupedNotifications = useMemo(
    () => groupNotifications(previewItems, timeZone),
    [previewItems, timeZone]
  );

  // Check if any read notifications exist for the Clear Read action
  const hasReadNotifications = useMemo(
    () => notifications.some((n) => n.isRead),
    [notifications]
  );

  // Click handler: Auto-mark as read before navigation
  const handleNotificationClick = (item: NotificationItemData) => {
    if (!item.isRead) {
      onMarkRead(item.id);
    }
    onClose();
    if (item.link) {
      const destination = item.link === '/users' ? '/employees' : item.link;
      router.push(destination);
    }
  };

  // Contextual empty state details
  const emptyStateConfig = useMemo(() => {
    switch (activeFilter) {
      case 'UNREAD':
        return {
          title: 'No unread notifications.',
          description: 'You are all caught up on pending items.',
          icon: CheckCheck,
        };
      case 'MAINTENANCE':
        return {
          title: 'No maintenance notifications.',
          description: 'No maintenance or service tickets recorded.',
          icon: Wrench,
        };
      case 'TESTING':
        return {
          title: 'No testing notifications.',
          description: 'No testing or inspection alerts recorded.',
          icon: FlaskConical,
        };
      case 'ACCOUNT':
        return {
          title: 'No account notifications.',
          description: 'No account or user profile updates recorded.',
          icon: UserCheck,
        };
      case 'WARRANTY':
        return {
          title: 'No warranty notifications.',
          description: 'No warranty or claim updates recorded.',
          icon: ShieldAlert,
        };
      case 'ALL':
      default:
        return {
          title: "You're all caught up.",
          description: 'No notifications available at this time.',
          icon: BellOff,
        };
    }
  }, [activeFilter]);

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
      role="dialog"
      aria-label="Notifications panel"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-eec-primary/10 text-eec-primary">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <LoadingButton
            type="button"
            onClick={async () => {
              setIsMarkingAll(true);
              try {
                await onMarkAllAsRead();
              } finally {
                setIsMarkingAll(false);
              }
            }}
            isLoading={isMarkingAll}
            loadingText="Marking..."
            variant="ghost"
            size="sm"
            className="!px-2 !py-1 text-xs text-eec-primary hover:text-eec-primary-dark"
            icon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark all read
          </LoadingButton>
        )}
      </div>

      {/* Filter Pills Header */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar">
        {FILTER_OPTIONS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={clsx(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer',
                isActive
                  ? 'bg-eec-primary text-white shadow-2xs font-semibold'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable Body with Grouping */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                  <div className="h-2.5 w-full bg-slate-200 rounded" />
                  <div className="h-2 w-1/3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : previewItems.length === 0 ? (
          <EmptyState
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            icon={emptyStateConfig.icon}
            className="py-10 px-4"
          />
        ) : (
          groupedNotifications.map((group) => (
            <div key={group.key} className="border-b border-slate-100 last:border-b-0">
              {/* Section Header */}
              <div className="sticky top-0 z-10 px-4 py-1.5 bg-slate-50/95 backdrop-blur-xs border-y border-slate-100/80 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {group.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {group.items.length}
                </span>
              </div>

              {/* Group Items */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <NotificationItem
                    key={item.id}
                    notification={item}
                    compact
                    timeZone={timeZone}
                    onClick={handleNotificationClick}
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dropdown Footer Actions */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
        <LoadingButton
          type="button"
          onClick={async () => {
            setIsClearing(true);
            try {
              await onClearRead();
            } finally {
              setIsClearing(false);
            }
          }}
          disabled={!hasReadNotifications}
          isLoading={isClearing}
          loadingText="Clearing..."
          variant="ghost"
          size="sm"
          className="!px-2.5 !py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50"
          icon={<Trash2 className="w-3.5 h-3.5" />}
          title="Clear all read notifications"
        >
          <span>Clear Read<span className="hidden sm:inline"> Notifications</span></span>
        </LoadingButton>

        <Link
          href="/notifications"
          onClick={onClose}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-eec-primary hover:text-eec-primary-dark hover:bg-slate-100/70 rounded-lg transition-colors"
        >
          <span>View All Notifications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
