/**
 * Notification Service — EEC EAMS (Phase 10B.1)
 * Business logic for Enterprise Notification Center.
 */

import {
  NotificationRepository,
  notificationRepository,
  NotificationFilterOptions,
} from './notification.repository';
import { CreateNotificationDTO, NotificationQueryDTO } from './notification.validator';
import { buildPagination } from '../../lib/api/pagination';
import { NotificationType } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class NotificationService {
  constructor(private repo: NotificationRepository = notificationRepository) {}

  /**
   * Send an in-app notification to a single user
   */
  async notifyUser(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string | null;
    isRead?: boolean;
    createdAt?: Date;
  }) {
    return this.repo.createNotification(data);
  }

  /**
   * Send in-app notifications to multiple users
   */
  async notifyUsers(
    notifications: Array<{
      userId: string;
      title: string;
      message: string;
      type: NotificationType;
      link?: string | null;
      isRead?: boolean;
      createdAt?: Date;
    }>
  ) {
    return this.repo.createManyNotifications(notifications);
  }

  /**
   * List paginated notifications for the authenticated user
   */
  async listNotifications(userId: string, query: NotificationQueryDTO) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filters: NotificationFilterOptions = {
      type: query.type,
      isRead: query.isRead,
      search: query.search,
    };

    const { notifications, total } = await this.repo.getNotificationsByUser(
      userId,
      page,
      limit,
      filters
    );

    const pagination = buildPagination(page, limit, total);

    return {
      notifications,
      pagination,
    };
  }

  /**
   * Get unread count for the authenticated user
   */
  async unreadCount(userId: string) {
    const count = await this.repo.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark a single notification as read
   */
  async readNotification(notificationId: string, userId: string) {
    const notification = await this.repo.markAsRead(notificationId, userId);
    if (!notification) {
      throw new AppError('Notification not found or access denied', 404);
    }
    return notification;
  }

  /**
   * Mark all unread notifications as read for the authenticated user
   */
  async readAllNotifications(userId: string) {
    return this.repo.markAllAsRead(userId);
  }

  /**
   * Delete all read notifications for the authenticated user
   */
  async clearReadNotifications(userId: string) {
    return this.repo.deleteReadNotifications(userId);
  }

  /**
   * Remove a notification for the authenticated user
   */
  async removeNotification(notificationId: string, userId: string) {
    const notification = await this.repo.deleteNotification(notificationId, userId);
    if (!notification) {
      throw new AppError('Notification not found or access denied', 404);
    }
    return { id: notification.id };
  }
}

export const notificationService = new NotificationService();
