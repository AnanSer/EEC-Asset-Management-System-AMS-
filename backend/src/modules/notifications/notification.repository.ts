/**
 * Notification Repository — EEC EAMS (Phase 10B.1)
 * Handles database operations for Enterprise Notification Center.
 */

import prisma from '../../lib/prisma';
import { NotificationType, Prisma } from '@prisma/client';

export interface NotificationFilterOptions {
  type?: string;
  isRead?: boolean;
  search?: string;
}

export class NotificationRepository {
  /**
   * Create a single notification
   */
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string | null;
    isRead?: boolean;
    createdAt?: Date;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link ?? null,
        isRead: data.isRead ?? false,
        ...(data.createdAt ? { createdAt: data.createdAt } : {}),
      },
    });
  }

  /**
   * Create multiple notifications in bulk
   */
  async createManyNotifications(
    data: Array<{
      userId: string;
      title: string;
      message: string;
      type: NotificationType;
      link?: string | null;
      isRead?: boolean;
      createdAt?: Date;
    }>
  ) {
    return prisma.notification.createMany({
      data: data.map((item) => ({
        userId: item.userId,
        title: item.title,
        message: item.message,
        type: item.type,
        link: item.link ?? null,
        isRead: item.isRead ?? false,
        ...(item.createdAt ? { createdAt: item.createdAt } : {}),
      })),
    });
  }

  /**
   * Get paginated notifications for a specific user with optional search and filters.
   * Newest notifications first.
   */
  async getNotificationsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: NotificationFilterOptions
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (filters?.type && filters.type !== 'ALL') {
      where.type = filters.type as NotificationType;
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters?.search && filters.search.trim() !== '') {
      const term = filters.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { message: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  /**
   * Get unread notification count for a specific user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Mark a single notification as read if it belongs to the user
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return null;
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all unread notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { count: result.count };
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteReadNotifications(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return { count: result.count };
  }

  /**
   * Delete a notification if it belongs to the user
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return null;
    }

    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}

export const notificationRepository = new NotificationRepository();
