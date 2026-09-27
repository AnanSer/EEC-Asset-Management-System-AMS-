/**
 * Notification Repository — EEC EAMS (Phase 10B.1)
 * Handles database operations for Enterprise Notification Center.
 */
import { NotificationType, Prisma } from '@prisma/client';
export interface NotificationFilterOptions {
    type?: string;
    isRead?: boolean;
    search?: string;
}
export declare class NotificationRepository {
    /**
     * Create a single notification
     */
    createNotification(data: {
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
     * Create multiple notifications in bulk
     */
    createManyNotifications(data: Array<{
        userId: string;
        title: string;
        message: string;
        type: NotificationType;
        link?: string | null;
        isRead?: boolean;
        createdAt?: Date;
    }>): Promise<Prisma.BatchPayload>;
    /**
     * Get paginated notifications for a specific user with optional search and filters.
     * Newest notifications first.
     */
    getNotificationsByUser(userId: string, page?: number, limit?: number, filters?: NotificationFilterOptions): Promise<{
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
        total: number;
    }>;
    /**
     * Get unread notification count for a specific user
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Mark a single notification as read if it belongs to the user
     */
    markAsRead(notificationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        title: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        link: string | null;
        isRead: boolean;
        createdAt: Date;
    } | null>;
    /**
     * Mark all unread notifications as read for a user
     */
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    /**
     * Delete all read notifications for a user
     */
    deleteReadNotifications(userId: string): Promise<{
        count: number;
    }>;
    /**
     * Delete a notification if it belongs to the user
     */
    deleteNotification(notificationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        title: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        link: string | null;
        isRead: boolean;
        createdAt: Date;
    } | null>;
}
export declare const notificationRepository: NotificationRepository;
//# sourceMappingURL=notification.repository.d.ts.map