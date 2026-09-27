'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import clsx from 'clsx';
import NotificationDropdown from './NotificationDropdown';
import {
  notificationService,
  NotificationItemData,
} from '@/services/notification.service';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const { branding } = useSystemSettings();
  const timeZone = branding?.timezone || 'Africa/Addis_Ababa';

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);

  // Badge bump animation state
  const [isBumping, setIsBumping] = useState(false);
  const prevCountRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res?.success && typeof res.data?.count === 'number') {
        const newCount = res.data.count;
        if (newCount > prevCountRef.current) {
          setIsBumping(true);
          setTimeout(() => setIsBumping(false), 300);
        }
        prevCountRef.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
    } finally {
      setIsCountLoading(false);
    }
  }, []);

  // Fetch recent notifications when dropdown opens (fetch 20 to allow instant filtering)
  const fetchRecentNotifications = useCallback(async () => {
    setIsListLoading(true);
    try {
      const res = await notificationService.getNotifications({ limit: 20 });
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch recent notifications:', err);
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const handleRefresh = () => {
      fetchUnreadCount();
      if (isOpen) {
        fetchRecentNotifications();
      }
    };

    window.addEventListener('eec-notification-refresh', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    return () => {
      window.removeEventListener('eec-notification-refresh', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [fetchUnreadCount, fetchRecentNotifications, isOpen]);

  // Handle dropdown toggle
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchRecentNotifications();
      fetchUnreadCount();
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Optimistic Mark Read
  const handleMarkRead = async (id: string) => {
    // Optimistic state update: mark as read immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => {
      const nextCount = Math.max(0, prev - 1);
      prevCountRef.current = nextCount;
      return nextCount;
    });

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      fetchUnreadCount();
    }
  };

  // Optimistic Mark All As Read
  const handleMarkAllAsRead = async () => {
    // Optimistic state update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    prevCountRef.current = 0;

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchUnreadCount();
      fetchRecentNotifications();
    }
  };

  // Optimistic Delete
  const handleDelete = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (target && !target.isRead) {
      setUnreadCount((prev) => {
        const nextCount = Math.max(0, prev - 1);
        prevCountRef.current = nextCount;
        return nextCount;
      });
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchRecentNotifications();
      fetchUnreadCount();
    }
  };

  // Optimistic Clear Read Notifications
  const handleClearRead = async () => {
    // Optimistic state update: remove only read notifications
    setNotifications((prev) => prev.filter((n) => !n.isRead));

    try {
      await notificationService.clearReadNotifications();
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
      fetchRecentNotifications();
      fetchUnreadCount();
    }
  };

  return (
    <div className={clsx('relative', className)} ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={clsx(
          'relative p-2 rounded-xl text-slate-500 hover:text-eec-primary hover:bg-slate-100 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-eec-primary/20',
          isOpen && 'bg-slate-100 text-eec-primary'
        )}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Loading Skeleton */}
        {isCountLoading ? (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        ) : (
          /* Unread Badge with Smooth Scale-up and Fade-out Animation */
          <span
            className={clsx(
              'absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white shadow-2xs transition-all duration-300 transform motion-reduce:transition-none motion-reduce:animate-none',
              unreadCount > 0
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-50 pointer-events-none',
              isBumping && 'scale-125 duration-150'
            )}
            aria-hidden={unreadCount === 0}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isListLoading}
          onMarkRead={handleMarkRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onClearRead={handleClearRead}
          onClose={() => setIsOpen(false)}
          timeZone={timeZone}
        />
      )}
    </div>
  );
}
