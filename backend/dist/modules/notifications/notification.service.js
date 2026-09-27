"use strict";
/**
 * Notification Service — EEC EAMS (Phase 10B.1)
 * Business logic for Enterprise Notification Center.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = exports.AppError = void 0;
const notification_repository_1 = require("./notification.repository");
const pagination_1 = require("../../lib/api/pagination");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class NotificationService {
    constructor(repo = notification_repository_1.notificationRepository) {
        this.repo = repo;
    }
    /**
     * Send an in-app notification to a single user
     */
    async notifyUser(data) {
        return this.repo.createNotification(data);
    }
    /**
     * Send in-app notifications to multiple users
     */
    async notifyUsers(notifications) {
        return this.repo.createManyNotifications(notifications);
    }
    /**
     * List paginated notifications for the authenticated user
     */
    async listNotifications(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const filters = {
            type: query.type,
            isRead: query.isRead,
            search: query.search,
        };
        const { notifications, total } = await this.repo.getNotificationsByUser(userId, page, limit, filters);
        const pagination = (0, pagination_1.buildPagination)(page, limit, total);
        return {
            notifications,
            pagination,
        };
    }
    /**
     * Get unread count for the authenticated user
     */
    async unreadCount(userId) {
        const count = await this.repo.getUnreadCount(userId);
        return { count };
    }
    /**
     * Mark a single notification as read
     */
    async readNotification(notificationId, userId) {
        const notification = await this.repo.markAsRead(notificationId, userId);
        if (!notification) {
            throw new AppError('Notification not found or access denied', 404);
        }
        return notification;
    }
    /**
     * Mark all unread notifications as read for the authenticated user
     */
    async readAllNotifications(userId) {
        return this.repo.markAllAsRead(userId);
    }
    /**
     * Delete all read notifications for the authenticated user
     */
    async clearReadNotifications(userId) {
        return this.repo.deleteReadNotifications(userId);
    }
    /**
     * Remove a notification for the authenticated user
     */
    async removeNotification(notificationId, userId) {
        const notification = await this.repo.deleteNotification(notificationId, userId);
        if (!notification) {
            throw new AppError('Notification not found or access denied', 404);
        }
        return { id: notification.id };
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map