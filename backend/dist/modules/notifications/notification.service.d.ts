/**
 * Notification Service — EEC EAMS (Phase 10B.1)
 * Business logic for Enterprise Notification Center.
 */
import { NotificationRepository } from './notification.repository';
import { NotificationQueryDTO } from './notification.validator';
import { NotificationType } from '@prisma/client';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class NotificationService {
    private repo;
    constructor(repo?: NotificationRepository);
    /**
     * Send an in-app notification to a single user
     */
    notifyUser(data: {
        userId: string;
        title: string;
        message: string;
        type: NotificationType;
        link?: string | null;
        isRead?: boolean;
        createdAt?: Date;
    }): Promise<{
        id: string;
        userId: string;
        title: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        link: string | null;
        isRead: boolean;
        createdAt: Date;
    }>;
    /**
     * Send in-app notifications to multiple users
     */
    notifyUsers(notifications: Array<{
        userId: string;
        title: string;
        message: string;
        type: NotificationType;
        link?: string | null;
        isRead?: boolean;
        createdAt?: Date;
    }>): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * List paginated notifications for the authenticated user
     */
    listNotifications(userId: string, query: NotificationQueryDTO): Promise<{
        notifications: {
            id: string;
            userId: string;
            title: string;
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            link: string | null;
            isRead: boolean;
            createdAt: Date;
        }[];
        pagination: import("../../lib/api").PaginationMeta;
    }>;
    /**
     * Get unread count for the authenticated user
     */
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
    /**
     * Mark a single notification as read
     */
    readNotification(notificationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        title: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        link: string | null;
        isRead: boolean;
        createdAt: Date;
    }>;
    /**
     * Mark all unread notifications as read for the authenticated user
     */
    readAllNotifications(userId: string): Promise<{
        count: number;
    }>;
    /**
     * Delete all read notifications for the authenticated user
     */
    clearReadNotifications(userId: string): Promise<{
        count: number;
    }>;
    /**
     * Remove a notification for the authenticated user
     */
    removeNotification(notificationId: string, userId: string): Promise<{
        id: string;
    }>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map