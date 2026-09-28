/**
 * Notification Service — EEC EAMS (Phase 10B.1)
 * Handles API communication with Express backend /api/notifications endpoints.
 */

import apiClient from '../lib/axios';

export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'MAINTENANCE'
  | 'TESTING'
  | 'ACCOUNT'
  | 'WARRANTY';

export interface NotificationItemData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean | string;
  search?: string;
}

export interface NotificationListResponse {
  success: boolean;
  message?: string;
  data: NotificationItemData[];
  meta: NotificationPaginationMeta;
  timestamp: string;
}

export interface UnreadCountResponse {
  success: boolean;
  message?: string;
  data: { count: number };
  timestamp: string;
}

export interface SingleNotificationResponse {
  success: boolean;
  message?: string;
  data: NotificationItemData;
  timestamp: string;
}

export interface ReadAllResponse {
  success: boolean;
  message?: string;
  data: { count: number };
  timestamp: string;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message?: string;
  data: { id: string } | null;
  timestamp: string;
}

export interface ClearReadResponse {
  success: boolean;
  message?: string;
  data: { count: number };
  timestamp: string;
}

import { appDataCache } from '../context/AppDataCacheContext';

export function triggerNotificationRefresh() {
  appDataCache.invalidate('notifications');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('eec-notification-refresh'));
  }
}

export const notificationService = {
  /**
   * GET /api/notifications — list authenticated user notifications with pagination & filters
   */
  async getNotifications(params?: NotificationQueryParams, forceRefresh = false): Promise<NotificationListResponse> {
    const key = `notifications:list:${JSON.stringify(params || {})}`;
    return appDataCache.fetchWithCache(
      key,
      async () => {
        const res = await apiClient.get<NotificationListResponse>('/notifications', { params });
        return res.data;
      },
      { forceRefresh }
    );
  },

  /**
   * GET /api/notifications/unread-count — returns unread notification count with request deduplication
   */
  async getUnreadCount(forceRefresh = false): Promise<UnreadCountResponse> {
    const key = 'notifications:unread_count';
    if (!forceRefresh) {
      const cached = appDataCache.getCached<UnreadCountResponse>(key);
      if (cached !== undefined) return cached;
    }

    return appDataCache.deduplicate(key, async () => {
      const res = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
      appDataCache.setCached(key, res.data, 60000); // 1 minute TTL unless event refreshed
      return res.data;
    });
  },

  /**
   * PATCH /api/notifications/:id/read — mark one notification as read
   */
  async markAsRead(id: string): Promise<SingleNotificationResponse> {
    const res = await apiClient.patch<SingleNotificationResponse>(`/notifications/${id}/read`);
    triggerNotificationRefresh();
    return res.data;
  },

  /**
   * PATCH /api/notifications/read-all — mark all notifications as read
   */
  async markAllAsRead(): Promise<ReadAllResponse> {
    const res = await apiClient.patch<ReadAllResponse>('/notifications/read-all');
    triggerNotificationRefresh();
    return res.data;
  },

  /**
   * DELETE /api/notifications/:id — delete a notification
   */
  async deleteNotification(id: string): Promise<DeleteNotificationResponse> {
    const res = await apiClient.delete<DeleteNotificationResponse>(`/notifications/${id}`);
    triggerNotificationRefresh();
    return res.data;
  },

  /**
   * DELETE /api/notifications/read — delete all read notifications
   */
  async clearReadNotifications(): Promise<ClearReadResponse> {
    const res = await apiClient.delete<ClearReadResponse>('/notifications/read');
    triggerNotificationRefresh();
    return res.data;
  },

  /**
   * Invalidate notification caches manually
   */
  invalidateCache() {
    triggerNotificationRefresh();
  },
};

export default notificationService;
