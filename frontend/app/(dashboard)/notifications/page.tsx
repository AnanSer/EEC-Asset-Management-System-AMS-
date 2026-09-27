'use client';

import React, { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  CheckCheck,
  Filter,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  Trash2,
} from 'lucide-react';
import PageHeader, { BreadcrumbItem } from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import InfoCard from '@/components/ui/InfoCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import LoadingButton from '@/components/ui/LoadingButton';
import {
  notificationService,
  NotificationItemData,
  NotificationPaginationMeta,
} from '@/services/notification.service';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { groupNotifications } from '@/utils/notification.utils';
import clsx from 'clsx';

const NOTIFICATION_TYPES: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All Types' },
  { value: 'INFO', label: 'Info' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'WARRANTY', label: 'Warranty' },
];

const READ_STATUSES: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All Status' },
  { value: 'UNREAD', label: 'Unread Only' },
  { value: 'READ', label: 'Read Only' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { branding } = useSystemSettings();
  const timeZone = branding?.timezone || 'Africa/Addis_Ababa';

  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [pagination, setPagination] = useState<NotificationPaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [, startTransition] = useTransition();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success && typeof res.data?.count === 'number') {
        setUnreadCount(res.data.count);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params: any = {
          page: currentPage,
          limit: 10,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (typeFilter !== 'ALL') {
          params.type = typeFilter;
        }

        if (statusFilter === 'UNREAD') {
          params.isRead = false;
        } else if (statusFilter === 'READ') {
          params.isRead = true;
        }

        const res = await notificationService.getNotifications(params);

        if (res.success) {
          setNotifications(res.data);
          if (res.meta) {
            setPagination(res.meta);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch notifications:', err);
        error('Failed to retrieve notifications. Please try again.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, debouncedSearch, typeFilter, statusFilter, error]
  );

  useEffect(() => {
    fetchNotifications();
    loadUnreadCount();
  }, [fetchNotifications, loadUnreadCount]);

  // Listen to global notification refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchNotifications();
      loadUnreadCount();
    };

    window.addEventListener('eec-notification-refresh', handleRefresh);
    return () => {
      window.removeEventListener('eec-notification-refresh', handleRefresh);
    };
  }, [fetchNotifications, loadUnreadCount]);

  // Mark single as read
  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
      success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark as read:', err);
      error('Failed to update notification status');
      fetchNotifications();
      loadUnreadCount();
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setIsMarkingAll(true);
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        success('All notifications marked as read');
        loadUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      error('Failed to mark all notifications as read');
      fetchNotifications();
      loadUnreadCount();
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    setIsClearing(true);
    // Optimistic update: filter out read notifications
    setNotifications((prev) => prev.filter((n) => !n.isRead));

    try {
      const res = await notificationService.clearReadNotifications();
      if (res.success) {
        success('Read notifications cleared successfully');
        fetchNotifications();
        loadUnreadCount();
      }
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
      error('Failed to clear read notifications');
      fetchNotifications();
      loadUnreadCount();
    } finally {
      setIsClearing(false);
    }
  };

  // Delete notification
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const target = notifications.find((n) => n.id === id);
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));

    try {
      await notificationService.deleteNotification(id);
      success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      error('Failed to delete notification');
      fetchNotifications();
      loadUnreadCount();
    }
  };

  // Click on notification: auto-mark as read before navigation
  const handleItemClick = (item: NotificationItemData) => {
    if (!item.isRead) {
      handleMarkRead(item.id);
    }
    if (item.link) {
      const destination = item.link === '/users' ? '/employees' : item.link;
      startTransition(() => {
        router.push(destination);
      });
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  const hasReadNotifications = notifications.some((n) => n.isRead);

  // Group notifications into: Today, Yesterday, Earlier This Week, Older
  const groupedNotifications = useMemo(
    () => groupNotifications(notifications, timeZone),
    [notifications, timeZone]
  );

  // Empty state title and description depending on active filter
  const emptyStateConfig = useMemo(() => {
    if (debouncedSearch.trim() !== '') {
      return {
        title: 'No Matching Notifications',
        description: `No notifications match "${debouncedSearch}". Try a different search term or clear filters.`,
        action: { label: 'Clear Filters', onClick: handleClearFilters },
      };
    }
    if (statusFilter === 'UNREAD') {
      return {
        title: 'No unread notifications.',
        description: 'You have acknowledged and reviewed all pending notifications.',
        action: { label: 'View All Notifications', onClick: handleClearFilters },
      };
    }
    if (typeFilter === 'MAINTENANCE') {
      return {
        title: 'No maintenance notifications.',
        description: 'No maintenance tickets or work order alerts are currently recorded.',
        action: { label: 'Clear Filter', onClick: handleClearFilters },
      };
    }
    if (typeFilter === 'TESTING') {
      return {
        title: 'No testing notifications.',
        description: 'No test requests or inspection items available right now.',
        action: { label: 'Clear Filter', onClick: handleClearFilters },
      };
    }
    if (typeFilter === 'ACCOUNT') {
      return {
        title: 'No account notifications.',
        description: 'No user account or profile updates at this time.',
        action: { label: 'Clear Filter', onClick: handleClearFilters },
      };
    }
    if (typeFilter === 'WARRANTY') {
      return {
        title: 'No warranty notifications.',
        description: 'No warranty expirations or claims currently flagged.',
        action: { label: 'Clear Filter', onClick: handleClearFilters },
      };
    }
    if (hasActiveFilters) {
      return {
        title: 'No Matching Notifications',
        description: 'No notifications match your selected filters. Try clearing filters.',
        action: { label: 'Clear Filters', onClick: handleClearFilters },
      };
    }
    return {
      title: "You're all caught up.",
      description: 'You have no notifications yet. System alerts and maintenance updates will appear here.',
      action: undefined,
    };
  }, [debouncedSearch, statusFilter, typeFilter, hasActiveFilters]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Notifications' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Enterprise Notification Center"
        description="Monitor system alerts, warranty expiries, maintenance updates, and personal activities."
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Refresh notifications"
            >
              <RefreshCw
                className={clsx('w-3.5 h-3.5 text-slate-500', isRefreshing && 'animate-spin')}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {hasReadNotifications && (
              <LoadingButton
                type="button"
                onClick={handleClearRead}
                isLoading={isClearing}
                loadingText="Clearing..."
                variant="secondary"
                size="sm"
                className="hover:!bg-rose-50 hover:!text-rose-600 hover:!border-rose-200"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                title="Clear read notifications"
              >
                <span className="hidden sm:inline">Clear Read</span>
              </LoadingButton>
            )}

            {unreadCount > 0 && (
              <LoadingButton
                type="button"
                onClick={handleMarkAllAsRead}
                isLoading={isMarkingAll}
                loadingText="Marking..."
                variant="primary"
                size="sm"
                icon={<CheckCheck className="w-4 h-4" />}
              >
                Mark All Read
              </LoadingButton>
            )}
          </div>
        }
      />

      {/* Info Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard
          title="Total Notifications"
          icon={Bell}
          subtitle="All archived enterprise alerts"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pagination.total}</span>
            <span className="text-xs text-slate-400">recorded</span>
          </div>
        </InfoCard>

        <InfoCard
          title="Unread Attention"
          icon={Clock}
          subtitle="Pending acknowledgements"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{unreadCount}</span>
            <span className="text-xs text-slate-400">action required</span>
          </div>
        </InfoCard>

        <InfoCard
          title="System Health"
          icon={ShieldCheck}
          subtitle="Enterprise activity monitoring"
        >
          <div className="flex items-center gap-2">
            <StatusBadge status="active" label="Operational" />
            <span className="text-xs text-slate-500">Real-time sync</span>
          </div>
        </InfoCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="eec-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications by title or message..."
              className="w-full pl-9 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 focus:border-eec-primary transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 cursor-pointer"
              >
                {NOTIFICATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Read/Unread Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-primary/20 cursor-pointer"
              >
                {READ_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List with Date Grouping */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <div className="eec-card">
            <EmptyState
              icon={hasActiveFilters ? Filter : Bell}
              title={emptyStateConfig.title}
              description={emptyStateConfig.description}
              action={emptyStateConfig.action}
            />
          </div>
        ) : (
          groupedNotifications.map((group) => (
            <div key={group.key} className="space-y-2.5">
              {/* Group Section Header */}
              <div className="flex items-center gap-2 pt-2 first:pt-0">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {group.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  {group.items.length}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Group Items */}
              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <NotificationItem
                    key={item.id}
                    notification={item}
                    timeZone={timeZone}
                    onClick={handleItemClick}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && notifications.length > 0 && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{pagination.total}</span>{' '}
            notifications
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevious && currentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page indicator pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                if (
                  pagination.totalPages > 6 &&
                  Math.abs(pageNum - currentPage) > 2 &&
                  pageNum !== 1 &&
                  pageNum !== pagination.totalPages
                ) {
                  if (Math.abs(pageNum - currentPage) === 3) {
                    return (
                      <span key={pageNum} className="text-xs text-slate-400 px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={clsx(
                      'min-w-[28px] h-7 px-1.5 text-xs font-semibold rounded-lg transition-colors',
                      pageNum === currentPage
                        ? 'bg-eec-primary text-white shadow-2xs'
                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext && currentPage >= pagination.totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
