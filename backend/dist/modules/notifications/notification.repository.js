"use strict";
/**
 * Notification Repository — EEC EAMS (Phase 10B.1)
 * Handles database operations for Enterprise Notification Center.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = exports.NotificationRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class NotificationRepository {
    /**
     * Create a single notification
     */
    async createNotification(data) {
        return prisma_1.default.notification.create({
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
    async createManyNotifications(data) {
        return prisma_1.default.notification.createMany({
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
    async getNotificationsByUser(userId, page = 1, limit = 10, filters) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);
        const skip = (safePage - 1) * safeLimit;
        const where = {
            userId,
        };
        if (filters?.type && filters.type !== 'ALL') {
            where.type = filters.type;
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
            prisma_1.default.notification.findMany({
                where,
                skip,
                take: safeLimit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.notification.count({ where }),
        ]);
        return { notifications, total };
    }
    /**
     * Get unread notification count for a specific user
     */
    async getUnreadCount(userId) {
        return prisma_1.default.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
    /**
     * Mark a single notification as read if it belongs to the user
     */
    async markAsRead(notificationId, userId) {
        const notification = await prisma_1.default.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            return null;
        }
        return prisma_1.default.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    /**
     * Mark all unread notifications as read for a user
     */
    async markAllAsRead(userId) {
        const result = await prisma_1.default.notification.updateMany({
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
    async deleteReadNotifications(userId) {
        const result = await prisma_1.default.notification.deleteMany({
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
    async deleteNotification(notificationId, userId) {
        const notification = await prisma_1.default.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            return null;
        }
        return prisma_1.default.notification.delete({
            where: { id: notificationId },
        });
    }
}
exports.NotificationRepository = NotificationRepository;
exports.notificationRepository = new NotificationRepository();
//# sourceMappingURL=notification.repository.js.map